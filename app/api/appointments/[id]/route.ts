import { NextResponse } from "next/server";

import {
  buildNotificationSummary,
  sendAppointmentNotifications
} from "@/lib/appointment-notifications";
import {
  appointmentsOverlap,
  calculateAppointmentEndTime,
  getBusinessHours
} from "@/lib/booking";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type UpdatePayload =
  | {
      action: "cancel";
    }
  | {
      action: "reschedule";
      fecha: string;
      horaInicio: string;
    };

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = (await request.json()) as Partial<UpdatePayload>;

  try {
    const currentAppointment = await prisma.appointment.findUnique({
      where: { id }
    });

    if (!currentAppointment) {
      return NextResponse.json({ message: "La cita no existe." }, { status: 404 });
    }

    if (body.action === "cancel") {
      const appointmentDate = formatDateForNotifications(currentAppointment.fecha);

      const updated = await prisma.appointment.update({
        where: { id },
        data: { estado: "CANCELADA" },
        select: {
          id: true,
          nombre: true,
          correo: true,
          telefono: true,
          fecha: true,
          horaInicio: true,
          horaFin: true,
          duracionMinutos: true,
          serviciosSeleccionados: true,
          estado: true
        }
      });

      const notificationResults = await sendAppointmentNotifications("CANCELLED", {
        id: updated.id,
        nombre: updated.nombre,
        correo: updated.correo,
        telefono: updated.telefono,
        fecha: appointmentDate,
        horaInicio: updated.horaInicio,
        horaFin: updated.horaFin,
        duracionMinutos: updated.duracionMinutos,
        serviciosSeleccionados: updated.serviciosSeleccionados
      });

      const notificationSummary = buildNotificationSummary(notificationResults);

      return NextResponse.json({
        message: notificationSummary
          ? `La cita fue cancelada correctamente. ${notificationSummary}`
          : "La cita fue cancelada correctamente.",
        data: updated,
        notifications: notificationResults
      });
    }

    if (body.action !== "reschedule") {
      return NextResponse.json({ message: "La accion enviada no es valida." }, { status: 400 });
    }

    const fecha = body.fecha?.trim() ?? "";
    const horaInicio = body.horaInicio?.trim() ?? "";

    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return NextResponse.json({ message: "La nueva fecha no es valida." }, { status: 400 });
    }

    if (!/^\d{2}:\d{2}$/.test(horaInicio)) {
      return NextResponse.json({ message: "La nueva hora no es valida." }, { status: 400 });
    }

    const businessHours = getBusinessHours(fecha);

    if (!businessHours) {
      return NextResponse.json(
        { message: "Los lunes no estan disponibles para reagendamiento." },
        { status: 400 }
      );
    }

    const appointmentStartMinutes =
      Number(horaInicio.split(":")[0]) * 60 + Number(horaInicio.split(":")[1]);
    const appointmentEnd = calculateAppointmentEndTime(
      horaInicio,
      currentAppointment.duracionMinutos
    );
    const appointmentEndMinutes =
      Number(appointmentEnd.split(":")[0]) * 60 + Number(appointmentEnd.split(":")[1]);
    const businessCloseMinutes =
      Number(businessHours.close.split(":")[0]) * 60 + Number(businessHours.close.split(":")[1]);
    const businessOpenMinutes =
      Number(businessHours.open.split(":")[0]) * 60 + Number(businessHours.open.split(":")[1]);

    if (
      appointmentStartMinutes < businessOpenMinutes ||
      appointmentEndMinutes > businessCloseMinutes
    ) {
      return NextResponse.json(
        { message: "La nueva hora no encaja dentro del horario laboral." },
        { status: 400 }
      );
    }

    const dayStart = new Date(`${fecha}T00:00:00`);
    const dayEnd = new Date(`${fecha}T23:59:59.999`);

    const sameDayAppointments = await prisma.appointment.findMany({
      where: {
        id: {
          not: id
        },
        fecha: {
          gte: dayStart,
          lte: dayEnd
        },
        estado: {
          not: "CANCELADA"
        }
      },
      select: {
        horaInicio: true,
        duracionMinutos: true
      }
    });

    const hasConflict = sameDayAppointments.some((appointment) =>
      appointmentsOverlap(
        horaInicio,
        currentAppointment.duracionMinutos,
        appointment.horaInicio,
        appointment.duracionMinutos
      )
    );

    if (hasConflict) {
      return NextResponse.json(
        { message: "La nueva hora seleccionada ya no esta disponible." },
        { status: 409 }
      );
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        fecha: new Date(`${fecha}T${horaInicio}:00`),
        horaInicio,
        horaFin: appointmentEnd,
        estado: "PENDIENTE"
      },
      select: {
        id: true,
        nombre: true,
        correo: true,
        telefono: true,
        fecha: true,
        horaInicio: true,
        horaFin: true,
        duracionMinutos: true,
        serviciosSeleccionados: true,
        estado: true
      }
    });

    const previousSchedule = {
      fecha: formatDateForNotifications(currentAppointment.fecha),
      horaInicio: currentAppointment.horaInicio,
      horaFin: currentAppointment.horaFin
    };

    const notificationResults = await sendAppointmentNotifications("RESCHEDULED", {
      id: updated.id,
      nombre: updated.nombre,
      correo: updated.correo,
      telefono: updated.telefono,
      fecha,
      horaInicio: updated.horaInicio,
      horaFin: updated.horaFin,
      duracionMinutos: updated.duracionMinutos,
      serviciosSeleccionados: updated.serviciosSeleccionados,
      previousSchedule
    });

    const notificationSummary = buildNotificationSummary(notificationResults);

    return NextResponse.json({
      message: notificationSummary
        ? `La cita fue reagendada correctamente. ${notificationSummary}`
        : "La cita fue reagendada correctamente.",
      data: updated,
      notifications: notificationResults
    });
  } catch (error) {
    console.error("Error updating appointment", error);

    return NextResponse.json(
      { message: "No se pudo actualizar la cita." },
      { status: 500 }
    );
  }
}

function formatDateForNotifications(value: Date) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Guayaquil",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(value));
}
