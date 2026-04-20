-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "duracionMinutos" INTEGER NOT NULL,
    "horaFin" TEXT NOT NULL,
    "serviciosSeleccionados" TEXT[],
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "appointments_fecha_horaInicio_idx" ON "appointments"("fecha", "horaInicio");
