"use client";

import { FormEvent, ReactNode, useMemo, useState } from "react";

import { serviceOptions } from "@/lib/booking";

type FormState = {
  nombre: string;
  telefono: string;
  servicio: string;
  fecha: string;
  hora: string;
};

type ErrorState = Partial<Record<keyof FormState, string>>;

const initialState: FormState = {
  nombre: "",
  telefono: "",
  servicio: serviceOptions[0],
  fecha: "",
  hora: ""
};

function getTodayLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function BookingForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<ErrorState>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const minDate = useMemo(() => getTodayLocalDate(), []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setServerMessage(null);

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const result = await response.json();

      if (!response.ok) {
        setErrors(result.errors ?? {});
        setServerMessage(result.message ?? "No se pudo enviar la solicitud.");
        return;
      }

      setErrors({});
      setServerMessage(result.message);
      setForm(initialState);
    } catch (error) {
      console.error(error);
      setServerMessage("Ocurrio un problema al procesar la reserva.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="reservas" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <div className="grid gap-10 rounded-[2rem] border border-white/10 bg-gradient-to-br from-fjord/70 via-night to-ember/80 p-8 shadow-glow lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-gold/80">
            Reservas online
          </p>
          <h2 className="mt-4 font-serif text-4xl text-white">
            Agenda tu cita en menos de un minuto.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-stone-300">
            El formulario ya queda preparado para conectar PostgreSQL con Prisma y luego sumar
            confirmaciones por WhatsApp o correo sin rehacer la estructura.
          </p>

          <div className="mt-8 rounded-3xl border border-gold/20 bg-gold/10 p-5 text-sm leading-7 text-stone-200">
            <p className="font-semibold text-white">Listo para escalar</p>
            <p className="mt-2">
              La API valida los datos, conserva una estructura clara y puede extenderse luego a
              panel administrativo, estados avanzados, recordatorios y multi negocio.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-5 rounded-[1.75rem] border border-white/10 bg-black/20 p-6"
        >
          <FormField label="Nombre" error={errors.nombre}>
            <input
              value={form.nombre}
              onChange={(event) => setForm((current) => ({ ...current, nombre: event.target.value }))}
              name="nombre"
              placeholder="Tu nombre completo"
              className="form-input"
            />
          </FormField>

          <FormField label="Telefono" error={errors.telefono}>
            <input
              value={form.telefono}
              onChange={(event) =>
                setForm((current) => ({ ...current, telefono: event.target.value }))
              }
              name="telefono"
              placeholder="098 192 6275"
              className="form-input"
            />
          </FormField>

          <FormField label="Servicio" error={errors.servicio}>
            <select
              value={form.servicio}
              onChange={(event) =>
                setForm((current) => ({ ...current, servicio: event.target.value }))
              }
              name="servicio"
              className="form-input"
            >
              {serviceOptions.map((option) => (
                <option key={option} value={option} className="bg-night text-white">
                  {option}
                </option>
              ))}
            </select>
          </FormField>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Fecha" error={errors.fecha}>
              <input
                value={form.fecha}
                onChange={(event) => setForm((current) => ({ ...current, fecha: event.target.value }))}
                name="fecha"
                min={minDate}
                type="date"
                className="form-input"
              />
            </FormField>

            <FormField label="Hora" error={errors.hora}>
              <input
                value={form.hora}
                onChange={(event) => setForm((current) => ({ ...current, hora: event.target.value }))}
                name="hora"
                type="time"
                className="form-input"
              />
            </FormField>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 inline-flex items-center justify-center rounded-full bg-gold px-6 py-3 text-base font-semibold text-night transition hover:bg-[#e7c983] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Enviando..." : "Confirmar reserva"}
          </button>

          {serverMessage ? (
            <p className="text-sm text-stone-200" aria-live="polite">
              {serverMessage}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}

type FormFieldProps = {
  children: ReactNode;
  label: string;
  error?: string;
};

function FormField({ children, label, error }: FormFieldProps) {
  return (
    <label className="grid gap-2 text-sm text-stone-200">
      <span>{label}</span>
      {children}
      {error ? <span className="text-xs text-red-300">{error}</span> : null}
    </label>
  );
}
