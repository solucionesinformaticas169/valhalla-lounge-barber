import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const allowedStatuses = new Set(["ATENDIDO", "NO_ATENDIDO", "PENDIENTE"]);

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = (await request.json()) as { estado?: string };
  const estado = body.estado?.trim().toUpperCase() ?? "";

  if (!allowedStatuses.has(estado)) {
    return NextResponse.json(
      { message: "El estado enviado no es válido." },
      { status: 400 }
    );
  }

  try {
    const appointment = await prisma.appointment.update({
      where: { id },
      data: { estado },
      select: {
        id: true,
        estado: true
      }
    });

    return NextResponse.json({
      message: "Estado actualizado correctamente.",
      data: appointment
    });
  } catch (error) {
    console.error("Error updating appointment status", error);

    return NextResponse.json(
      { message: "No se pudo actualizar el estado de la cita." },
      { status: 500 }
    );
  }
}
