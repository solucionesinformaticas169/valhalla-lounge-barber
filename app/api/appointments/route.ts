import { NextResponse } from "next/server";

import { sendAppointmentNotifications } from "@/lib/appointment-notifications";
import { prisma } from "@/lib/prisma";
import {
  appointmentsOverlap,
  calculateAppointmentDuration,
  calculateAppointmentEndTime,
  validateAppointment,
  type AppointmentInput
} from "@/lib/booking";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const excludeId = searchParams.get("excludeId");

  if (!date) {
    return NextResponse.json({ message: "La fecha es obligatoria." }, { status: 400 });
  }

  const start = new Date(`${date}T00:00:00`);
  const end = new Date(`${date}T23:59:59`);

  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        ...(excludeId
          ? {
              id: {
                not: excludeId
              }
            }
          : {}),
        fecha: {
          gte: start,
          lte: end
        },
        estado: {
          not: "CANCELADA"
        }
      },
      select: {
        id: true,
        horaInicio: true,
        horaFin: true,
        serviciosSeleccionados: true,
        duracionMinutos: true
      },
      orderBy: {
        horaInicio: "asc"
      }
    });

    return NextResponse.json({ data: appointments });
  } catch (error) {
    console.error("Error fetching appointments", error);

    return NextResponse.json(
      { message: "No se pudieron consultar las citas registradas." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as AppointmentInput;
  const validation = validateAppointment(body);

  if (!validation.isValid) {
    return NextResponse.json(
      {
        message: "Revisa los datos del formulario.",
        errors: validation.errors
      },
      { status: 400 }
    );
  }

  const duration =
    validation.duration || calculateAppointmentDuration(body.serviciosSeleccionados);
  const appointmentDate = new Date(`${body.fecha}T${body.horaInicio}:00`);
  const start = new Date(`${body.fecha}T00:00:00`);
  const end = new Date(`${body.fecha}T23:59:59`);

  try {
    const sameDayAppointments = await prisma.appointment.findMany({
      where: {
        fecha: {
          gte: start,
          lte: end
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
        body.horaInicio,
        duration,
        appointment.horaInicio,
        appointment.duracionMinutos
      )
    );

    if (hasConflict) {
      return NextResponse.json(
        {
          message: "Ese horario ya no esta disponible. Elige otra hora."
        },
        { status: 409 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        nombre: body.nombre.trim(),
        correo: body.correo?.trim().toLowerCase() ?? "",
        telefono: body.telefono.trim(),
        serviciosSeleccionados: validation.selectedServices,
        fecha: appointmentDate,
        horaInicio: body.horaInicio,
        duracionMinutos: duration,
        horaFin: calculateAppointmentEndTime(body.horaInicio, duration)
      }
    });

    const notificationResults = await sendAppointmentNotifications("CREATED", {
      id: appointment.id,
      nombre: appointment.nombre,
      correo: appointment.correo,
      telefono: appointment.telefono,
      fecha: body.fecha,
      horaInicio: appointment.horaInicio,
      horaFin: appointment.horaFin,
      duracionMinutos: appointment.duracionMinutos,
      serviciosSeleccionados: appointment.serviciosSeleccionados
    });

    return NextResponse.json({
      message: `Reserva registrada para ${appointment.nombre}.`,
      data: appointment,
      notifications: notificationResults
    });
  } catch (error) {
    console.error("Error creating appointment", error);

    return NextResponse.json(
      {
        message:
          "La API esta lista, pero falta sincronizar la base de datos. Ejecuta Prisma para aplicar los cambios."
      },
      { status: 503 }
    );
  }
}
