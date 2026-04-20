import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

function getGuayaquilNowParts() {
  const formatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Guayaquil",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  const parts = formatter.formatToParts(new Date());
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";

  return {
    currentDate: `${get("year")}-${get("month")}-${get("day")}`,
    currentTime: `${get("hour")}:${get("minute")}`
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const nombre = searchParams.get("nombre")?.trim() ?? "";

  if (!nombre) {
    return NextResponse.json(
      { message: "Debes ingresar tu nombre para consultar tu cita." },
      { status: 400 }
    );
  }

  const { currentDate, currentTime } = getGuayaquilNowParts();
  const startOfToday = new Date(`${currentDate}T00:00:00`);

  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        nombre: {
          contains: nombre,
          mode: "insensitive"
        },
        fecha: {
          gte: startOfToday
        },
        estado: {
          equals: "PENDIENTE"
        }
      },
      orderBy: [{ fecha: "asc" }, { horaInicio: "asc" }],
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

    const filteredAppointments = appointments.filter((appointment) => {
      const appointmentDay = new Intl.DateTimeFormat("sv-SE", {
        timeZone: "America/Guayaquil",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }).format(new Date(appointment.fecha));

      if (appointmentDay > currentDate) {
        return true;
      }

      if (appointmentDay < currentDate) {
        return false;
      }

      return appointment.horaFin >= currentTime;
    });

    return NextResponse.json({ data: filteredAppointments });
  } catch (error) {
    console.error("Error searching appointments", error);

    return NextResponse.json(
      { message: "No se pudo consultar la cita agendada." },
      { status: 500 }
    );
  }
}
