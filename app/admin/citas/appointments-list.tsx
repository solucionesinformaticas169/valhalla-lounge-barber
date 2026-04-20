"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Clock3, Phone, Scissors, User } from "lucide-react";

type AppointmentListItem = {
  id: string;
  nombre: string;
  telefono: string;
  correo?: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  duracionMinutos: number;
  serviciosSeleccionados: string[];
  estado: string;
};

type AppointmentsListProps = {
  initialAppointments: AppointmentListItem[];
};

export function AppointmentsList({ initialAppointments }: AppointmentsListProps) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    setAppointments(initialAppointments);
  }, [initialAppointments]);

  const updateStatus = async (id: string, estado: "ATENDIDO" | "NO_ATENDIDO") => {
    setUpdatingId(id);

    try {
      const response = await fetch(`/api/appointments/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ estado })
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message ?? "No se pudo actualizar el estado.");
      }

      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === id ? { ...appointment, estado: payload.data.estado } : appointment
        )
      );
    } catch (error) {
      console.error(error);
      window.alert("No se pudo actualizar el estado de la cita.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="mt-8 overflow-hidden rounded-[24px] border border-[#8b5d28]/35 bg-[linear-gradient(180deg,rgba(53,29,17,0.65),rgba(18,10,7,0.96))]">
      <div className="grid grid-cols-1 gap-px bg-[#8b5d28]/20">
        {appointments.length === 0 ? (
          <div className="bg-[#1c100b] px-6 py-8 text-white/72">
            No hay citas registradas con los filtros seleccionados.
          </div>
        ) : (
          appointments.map((appointment) => (
            <article
              key={appointment.id}
              className="grid gap-6 bg-[#1c100b] px-6 py-6 lg:grid-cols-[1fr_1fr_1.15fr]"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-[#efc167]">
                  <User className="h-4 w-4" />
                  <span className="font-semibold text-white">{appointment.nombre}</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <Phone className="h-4 w-4 text-[#c69046]" />
                  <span>{appointment.telefono}</span>
                </div>
                {appointment.correo ? (
                  <div className="flex items-center gap-3 text-white/80">
                    <span className="inline-flex h-4 w-4 items-center justify-center text-[#c69046]">@</span>
                    <span>{appointment.correo}</span>
                  </div>
                ) : null}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-white/82">
                  <CalendarDays className="h-4 w-4 text-[#c69046]" />
                  <span>{appointment.fecha}</span>
                </div>
                <div className="flex items-center gap-3 text-white/82">
                  <Clock3 className="h-4 w-4 text-[#c69046]" />
                  <span>
                    {appointment.horaInicio} - {appointment.horaFin}
                  </span>
                </div>
                <div className="text-white/82">
                  <span className="text-[#c69046]">Duración:</span> {appointment.duracionMinutos} min
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 text-white/82">
                  <Scissors className="mt-1 h-4 w-4 text-[#c69046]" />
                  <span>{appointment.serviciosSeleccionados.join(" + ")}</span>
                </div>

                <div className="text-white/82">
                  <span className="text-[#c69046]">Estado:</span>{" "}
                  <span
                    className={
                      appointment.estado === "ATENDIDO"
                        ? "text-[#d7c18c]"
                        : appointment.estado === "NO_ATENDIDO"
                          ? "text-[#f0a7a7]"
                          : "text-white"
                    }
                  >
                    {appointment.estado}
                  </span>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => updateStatus(appointment.id, "ATENDIDO")}
                    disabled={updatingId === appointment.id}
                    className={`inline-flex items-center justify-center rounded-full border px-5 py-3 font-semibold transition disabled:opacity-60 ${
                      appointment.estado === "ATENDIDO"
                        ? "border-[#d7a24e] bg-[linear-gradient(180deg,rgba(110,59,26,0.96),rgba(58,30,17,0.98))] text-[#f0d59a]"
                        : "border-[#8b5d28]/40 bg-[#24130d]/75 text-white/85 hover:border-[#c28b32]"
                    }`}
                  >
                    Atendido
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStatus(appointment.id, "NO_ATENDIDO")}
                    disabled={updatingId === appointment.id}
                    className={`inline-flex items-center justify-center rounded-full border px-5 py-3 font-semibold transition disabled:opacity-60 ${
                      appointment.estado === "NO_ATENDIDO"
                        ? "border-[#b85b4f] bg-[linear-gradient(180deg,rgba(110,41,34,0.96),rgba(58,22,19,0.98))] text-[#ffe0db]"
                        : "border-[#8b5d28]/40 bg-[#24130d]/75 text-white/85 hover:border-[#c28b32]"
                    }`}
                  >
                    No atendido
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
