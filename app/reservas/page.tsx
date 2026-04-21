"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarIcon,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Phone,
  RefreshCcw,
  Search,
  Trash2,
  User
} from "lucide-react";

import { appointmentsOverlap, buildAvailableSlots, calculateAppointmentEndTime } from "@/lib/booking";

const whatsappUrl = "https://wa.me/593981926275";
const weekDays = ["L", "M", "X", "J", "V", "S", "D"];
const monthNames = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre"
];
const today = new Date().toISOString().split("T")[0];

type AppointmentLookupItem = {
  id: string;
  nombre: string;
  correo?: string;
  telefono: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  duracionMinutos: number;
  serviciosSeleccionados: string[];
  estado: string;
};

type BusyAppointment = {
  id: string;
  horaInicio: string;
  horaFin: string;
  serviciosSeleccionados: string[];
  duracionMinutos: number;
};

type CalendarDay = {
  iso: string;
  label: number;
  isCurrentMonth: boolean;
  isDisabled: boolean;
};

function formatDateLabel(value: string) {
  if (!value) return "dd/mm/aaaa";

  return new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(`${value}T12:00:00`));
}

export default function ReservasPage() {
  const rescheduleCalendarRef = useRef<HTMLDivElement>(null);
  const [queryName, setQueryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [appointments, setAppointments] = useState<AppointmentLookupItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<Record<string, string>>({});
  const [rescheduleTime, setRescheduleTime] = useState<Record<string, string>>({});
  const [busyAppointments, setBusyAppointments] = useState<Record<string, BusyAppointment[]>>({});
  const [loadingSlotsFor, setLoadingSlotsFor] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [openRescheduleCalendarId, setOpenRescheduleCalendarId] = useState<string | null>(null);
  const [rescheduleCalendarMonth, setRescheduleCalendarMonth] = useState<Record<string, string>>({});

  const availableSlotsByAppointment = useMemo(() => {
    const result: Record<string, string[]> = {};

    appointments.forEach((appointment) => {
      const selectedDate = rescheduleDate[appointment.id];
      if (!selectedDate) {
        result[appointment.id] = [];
        return;
      }

      const slots = buildAvailableSlots(selectedDate, appointment.duracionMinutos);
      const taken = busyAppointments[appointment.id] ?? [];

      result[appointment.id] = slots.filter(
        (slot) =>
          !taken.some((busy) =>
            appointmentsOverlap(slot, appointment.duracionMinutos, busy.horaInicio, busy.duracionMinutos)
          )
      );
    });

    return result;
  }, [appointments, busyAppointments, rescheduleDate]);

  useEffect(() => {
    if (!expandedId) return;

    const selectedDate = rescheduleDate[expandedId];
    if (!selectedDate) return;

    let active = true;
    setLoadingSlotsFor(expandedId);

    fetch(`/api/appointments?date=${selectedDate}&excludeId=${expandedId}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("No se pudieron cargar los horarios ocupados.");
        }

        return response.json();
      })
      .then((payload) => {
        if (!active) return;

        setBusyAppointments((current) => ({
          ...current,
          [expandedId]: payload.data ?? []
        }));
      })
      .catch(() => {
        if (!active) return;

        setBusyAppointments((current) => ({
          ...current,
          [expandedId]: []
        }));
      })
      .finally(() => {
        if (active) {
          setLoadingSlotsFor((current) => (current === expandedId ? null : current));
        }
      });

    return () => {
      active = false;
    };
  }, [expandedId, rescheduleDate]);

  useEffect(() => {
    if (!openRescheduleCalendarId) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rescheduleCalendarRef.current?.contains(event.target as Node)) {
        setOpenRescheduleCalendarId(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [openRescheduleCalendarId]);

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!queryName.trim()) {
      setError("Debes ingresar tu nombre para consultar tu cita.");
      setMessage("");
      setAppointments([]);
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    setExpandedId(null);

    try {
      const response = await fetch(`/api/appointments/search?nombre=${encodeURIComponent(queryName.trim())}`);
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.message ?? "No se pudo consultar la cita.");
        setAppointments([]);
        return;
      }

      const nextAppointments = (payload.data ?? []).map((appointment: AppointmentLookupItem) => ({
        ...appointment,
        fecha: new Date(appointment.fecha).toISOString()
      }));

      setAppointments(nextAppointments);
      setMessage(
        nextAppointments.length > 0
          ? "Cita encontrada. Puedes revisar, reagendar o cancelar."
          : "No se encontraron citas pendientes a futuro con ese nombre."
      );
    } catch {
      setError("Hubo un problema al consultar la cita.");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleReschedule = (appointment: AppointmentLookupItem) => {
    setExpandedId((current) => (current === appointment.id ? null : appointment.id));
    setRescheduleDate((current) => ({
      ...current,
      [appointment.id]:
        current[appointment.id] ??
        new Date(appointment.fecha).toISOString().split("T")[0]
    }));
    setRescheduleTime((current) => ({
      ...current,
      [appointment.id]: current[appointment.id] ?? appointment.horaInicio
    }));
    setRescheduleCalendarMonth((current) => ({
      ...current,
      [appointment.id]:
        current[appointment.id] ??
        `${new Date(appointment.fecha).getFullYear()}-${String(new Date(appointment.fecha).getMonth() + 1).padStart(2, "0")}-01`
    }));
  };

  const getCalendarMonthDate = (appointmentId: string, selectedDate: string) => {
    const monthValue =
      rescheduleCalendarMonth[appointmentId] ??
      `${new Date(`${selectedDate}T12:00:00`).getFullYear()}-${String(
        new Date(`${selectedDate}T12:00:00`).getMonth() + 1
      ).padStart(2, "0")}-01`;

    return new Date(`${monthValue}T12:00:00`);
  };

  const getCalendarDays = (appointmentId: string, selectedDate: string) => {
    const calendarMonthDate = getCalendarMonthDate(appointmentId, selectedDate);
    const firstDay = new Date(
      calendarMonthDate.getFullYear(),
      calendarMonthDate.getMonth(),
      1,
      12
    );
    const startOffset = (firstDay.getDay() + 6) % 7;
    const gridStart = new Date(firstDay);
    gridStart.setDate(firstDay.getDate() - startOffset);

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      date.setHours(12, 0, 0, 0);

      const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
        date.getDate()
      ).padStart(2, "0")}`;
      const weekday = date.getDay();

      return {
        iso,
        label: date.getDate(),
        isCurrentMonth: date.getMonth() === calendarMonthDate.getMonth(),
        isDisabled: iso < today || weekday === 1
      } satisfies CalendarDay;
    });
  };

  const shiftRescheduleCalendarMonth = (appointmentId: string, direction: -1 | 1, selectedDate: string) => {
    const base = getCalendarMonthDate(appointmentId, selectedDate);
    const next = new Date(base);
    next.setMonth(base.getMonth() + direction);
    next.setDate(1);
    next.setHours(12, 0, 0, 0);

    setRescheduleCalendarMonth((current) => ({
      ...current,
      [appointmentId]: `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-01`
    }));
  };

  const handleRescheduleCalendarSelect = (appointmentId: string, day: CalendarDay) => {
    if (day.isDisabled) return;

    setRescheduleDate((current) => ({
      ...current,
      [appointmentId]: day.iso
    }));
    setRescheduleTime((current) => ({
      ...current,
      [appointmentId]: ""
    }));
    setOpenRescheduleCalendarId(null);
  };

  const handleReschedule = async (appointment: AppointmentLookupItem) => {
    const fecha = rescheduleDate[appointment.id];
    const horaInicio = rescheduleTime[appointment.id];

    if (!fecha || !horaInicio) {
      setError("Debes seleccionar una nueva fecha y una nueva hora.");
      setMessage("");
      return;
    }

    setUpdatingId(appointment.id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "reschedule",
          fecha,
          horaInicio
        })
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload.message ?? "No se pudo reagendar la cita.");
        return;
      }

      setAppointments((current) =>
        current.map((item) =>
          item.id === appointment.id
            ? {
                ...item,
                fecha: payload.data.fecha,
                horaInicio: payload.data.horaInicio,
                horaFin: payload.data.horaFin,
                estado: payload.data.estado
              }
            : item
        )
      );
      setExpandedId(null);
      setMessage(payload.message ?? "La cita fue reagendada correctamente.");
    } catch {
      setError("Hubo un problema al reagendar la cita.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancel = async (appointment: AppointmentLookupItem) => {
    setUpdatingId(appointment.id);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "cancel"
        })
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload.message ?? "No se pudo cancelar la cita.");
        return;
      }

      setAppointments((current) => current.filter((item) => item.id !== appointment.id));
      setExpandedId((current) => (current === appointment.id ? null : current));
      setMessage(payload.message ?? "La cita fue cancelada.");
    } catch {
      setError("Hubo un problema al cancelar la cita.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#120a06] text-white">
      <div className="relative min-h-screen bg-[radial-gradient(circle_at_center,rgba(180,120,40,0.18),rgba(10,6,4,0.98)_55%)]">
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-screen">
          <Image src="/images/noise.png" alt="Textura" fill className="object-cover" priority />
        </div>

        <section className="mx-auto max-w-[1700px] px-3 pb-10 pt-6 sm:px-6 sm:pb-12 sm:pt-10 lg:pt-14">
          <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#8f602a]/50 bg-[linear-gradient(180deg,rgba(45,24,14,0.92),rgba(26,14,9,0.96))] px-5 py-3 text-center text-[#e0b766] transition hover:border-[#c28b32] sm:w-auto"
            >
              <ChevronLeft className="h-4 w-4" />
              Volver al home
            </Link>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-[#8f602a]/45 bg-[linear-gradient(180deg,rgba(45,24,14,0.92),rgba(26,14,9,0.96))] px-5 py-3 text-center text-[#e0b766] sm:w-auto"
            >
              <Phone className="h-4 w-4" />
              Soporte por Whatsapp
            </a>
          </div>

          <section className="rounded-[28px] border border-[#5b3c1a]/35 bg-[linear-gradient(180deg,rgba(21,11,7,0.98),rgba(11,6,4,0.98))] p-3 shadow-[0_25px_80px_rgba(0,0,0,0.5)] sm:rounded-[34px] sm:p-6 lg:p-10">
            <div className="relative rounded-[24px] border border-[#7c5325]/30 bg-[linear-gradient(180deg,rgba(34,18,12,0.98),rgba(20,10,7,0.98))] p-4 sm:rounded-[28px] sm:p-8 lg:p-10">
              <div className="pointer-events-none absolute inset-0 opacity-[0.18]">
                <Image src="/images/valhalla-bg.jpg" alt="Fondo" fill className="object-cover" />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,157,68,0.16),rgba(0,0,0,0.9)_62%,rgba(0,0,0,0.98)_100%)]" />

              <div className="relative z-10 grid gap-5 sm:gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-[22px] border border-[#8b5d28]/35 bg-[linear-gradient(180deg,rgba(63,33,17,0.72),rgba(36,18,11,0.9))] p-4 sm:rounded-[28px] sm:p-8">
                  <div className="inline-flex rounded-full border border-[#8e632c]/55 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-[#d7a24e]">
                    Consulta tu cita
                  </div>

                  <h1 className="mt-5 max-w-[14ch] font-serif text-[clamp(1.9rem,7vw,3.2rem)] leading-[1] text-[#efc167] sm:mt-6 sm:leading-[0.98]">
                    Busca, reagenda o cancela tu reserva
                  </h1>

                  <p className="mt-4 max-w-[54ch] text-sm leading-7 text-white/82 sm:mt-5 sm:text-lg sm:leading-8">
                    Ingresa tu nombre para ver tus citas pendientes y futuras. Si lo necesitas,
                    podrás moverlas a una nueva hora disponible o cancelarlas.
                  </p>

                  <form onSubmit={handleSearch} className="mt-6 grid gap-4 sm:mt-8">
                    <label className="grid gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c69046]">
                        Nombre
                      </span>
                      <input
                        value={queryName}
                        onChange={(event) => setQueryName(event.target.value)}
                        className="rounded-[16px] border border-[#8b5d28]/30 bg-[#24130d]/75 px-4 py-3 text-white outline-none transition focus:border-[#c69046]"
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={loading}
                      className="mt-2 inline-flex w-full items-center justify-center gap-3 rounded-full border border-[#c28b32] bg-[linear-gradient(180deg,rgba(60,35,20,0.96),rgba(31,19,12,0.98))] px-6 py-4 text-base font-semibold text-[#f0d59a] shadow-[0_0_28px_rgba(194,139,50,0.16)] transition hover:shadow-[0_0_34px_rgba(194,139,50,0.26)] disabled:opacity-60 sm:px-8 sm:text-lg"
                    >
                      <Search className="h-5 w-5" />
                      {loading ? "Buscando..." : "Buscar cita"}
                    </button>
                  </form>

                  {error ? <p className="mt-4 text-sm text-[#f0a7a7]">{error}</p> : null}
                  {message ? <p className="mt-4 text-sm text-[#d7c18c]">{message}</p> : null}
                </div>

                <div className="rounded-[22px] border border-[#8b5d28]/35 bg-[linear-gradient(180deg,rgba(63,33,17,0.72),rgba(36,18,11,0.9))] p-4 sm:rounded-[28px] sm:p-8">
                  <h2 className="font-serif text-[1.75rem] text-[#efc167] sm:text-3xl">Citas encontradas</h2>

                  <div className="mt-5 grid gap-4 sm:mt-6">
                    {appointments.length === 0 ? (
                      <div className="rounded-[20px] border border-[#8b5d28]/35 bg-[linear-gradient(180deg,rgba(52,27,15,0.82),rgba(30,15,10,0.9))] p-4 text-sm leading-7 text-white/74 sm:rounded-[22px] sm:p-5 sm:text-base">
                        Aquí aparecerán las citas pendientes y futuras cuando las busques por nombre.
                      </div>
                    ) : (
                      appointments.map((appointment) => {
                        const appointmentDate = new Date(appointment.fecha).toISOString().split("T")[0];
                        const availableSlots = availableSlotsByAppointment[appointment.id] ?? [];
                        const selectedDate = rescheduleDate[appointment.id] ?? appointmentDate;
                        const selectedTime = rescheduleTime[appointment.id] ?? appointment.horaInicio;
                        const calendarMonthDate = getCalendarMonthDate(appointment.id, selectedDate);
                        const calendarDays = getCalendarDays(appointment.id, selectedDate);

                        return (
                          <article
                            key={appointment.id}
                            className="rounded-[20px] border border-[#8b5d28]/35 bg-[linear-gradient(180deg,rgba(52,27,15,0.82),rgba(30,15,10,0.9))] p-4 sm:rounded-[24px] sm:p-5"
                          >
                            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                              <div className="space-y-3">
                                <div className="flex items-center gap-3 text-[#efc167]">
                                  <User className="h-4 w-4 shrink-0" />
                                  <span className="break-words font-semibold text-white">{appointment.nombre}</span>
                                </div>
                                <div className="break-words text-sm leading-6 text-white/82 sm:text-base">
                                  {appointment.serviciosSeleccionados.join(" + ")}
                                </div>
                                {appointment.correo ? (
                                  <div className="break-words text-sm leading-6 text-white/76 sm:text-base">
                                    {appointment.correo}
                                  </div>
                                ) : null}
                                <div className="break-words text-sm leading-6 text-white/76 sm:text-base">
                                  {appointment.telefono}
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-start gap-3 text-sm leading-6 text-white/82 sm:text-base">
                                  <CalendarDays className="mt-1 h-4 w-4 shrink-0 text-[#c69046]" />
                                  <span>{new Date(appointment.fecha).toLocaleDateString("es-EC")}</span>
                                </div>
                                <div className="flex items-start gap-3 text-sm leading-6 text-white/82 sm:text-base">
                                  <Clock3 className="mt-1 h-4 w-4 shrink-0 text-[#c69046]" />
                                  <span>
                                    {appointment.horaInicio} - {appointment.horaFin}
                                  </span>
                                </div>
                                <div className="text-sm leading-6 text-white/82 sm:text-base">
                                  <span className="text-[#c69046]">Estado:</span> {appointment.estado}
                                </div>
                              </div>
                            </div>

                            <div className="mt-5 grid gap-3 sm:flex sm:flex-wrap">
                              <button
                                type="button"
                                onClick={() => handleToggleReschedule(appointment)}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#c28b32] bg-[linear-gradient(180deg,rgba(60,35,20,0.96),rgba(31,19,12,0.98))] px-5 py-3 font-semibold text-[#f0d59a] sm:w-auto"
                              >
                                <RefreshCcw className="h-4 w-4" />
                                Reagendar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCancel(appointment)}
                                disabled={updatingId === appointment.id}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#a75a4a]/50 bg-[linear-gradient(180deg,rgba(70,30,23,0.96),rgba(38,17,13,0.98))] px-5 py-3 font-semibold text-[#ffd9d3] disabled:opacity-60 sm:w-auto"
                              >
                                <Trash2 className="h-4 w-4" />
                                Cancelar cita
                              </button>
                            </div>

                            {expandedId === appointment.id ? (
                              <div className="mt-5 grid gap-4 rounded-[20px] border border-[#8b5d28]/30 bg-[#24130d]/70 p-4 sm:rounded-[22px] sm:p-5">
                                <div className="grid gap-4 sm:grid-cols-2">
                                  <label className="grid gap-2">
                                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c69046]">
                                      Nueva fecha
                                    </span>
                                    <div ref={openRescheduleCalendarId === appointment.id ? rescheduleCalendarRef : undefined} className="relative">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setOpenRescheduleCalendarId((current) =>
                                            current === appointment.id ? null : appointment.id
                                          )
                                        }
                                        className="flex w-full items-center justify-between rounded-[16px] border border-[#8b5d28]/30 bg-[#1d100b]/80 px-4 py-3 text-left text-white outline-none transition hover:border-[#a97332]/50 focus:border-[#c69046]"
                                      >
                                        <span>{formatDateLabel(selectedDate)}</span>
                                        <CalendarIcon className="h-5 w-5 text-[#e0b766]" />
                                      </button>

                                      {openRescheduleCalendarId === appointment.id ? (
                                        <div className="absolute left-0 top-[calc(100%+0.55rem)] z-30 w-full max-w-[280px] rounded-[18px] border border-[#8b5d28]/45 bg-[linear-gradient(180deg,rgba(46,24,14,0.98),rgba(26,14,9,0.98))] p-2.5 shadow-[0_20px_42px_rgba(0,0,0,0.44)] backdrop-blur-xl sm:w-[250px] sm:max-w-none">
                                          <div className="mb-3 flex items-center justify-between">
                                            <button
                                              type="button"
                                              onClick={() =>
                                                shiftRescheduleCalendarMonth(appointment.id, -1, selectedDate)
                                              }
                                              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#8b5d28]/35 text-[#e0b766] transition hover:border-[#c28b32] hover:text-[#f0d59a]"
                                              aria-label="Mes anterior"
                                            >
                                              <ChevronLeft className="h-3.5 w-3.5" />
                                            </button>
                                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#efc167]">
                                              {monthNames[calendarMonthDate.getMonth()]} de {calendarMonthDate.getFullYear()}
                                            </div>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                shiftRescheduleCalendarMonth(appointment.id, 1, selectedDate)
                                              }
                                              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#8b5d28]/35 text-[#e0b766] transition hover:border-[#c28b32] hover:text-[#f0d59a]"
                                              aria-label="Mes siguiente"
                                            >
                                              <ChevronRight className="h-3.5 w-3.5" />
                                            </button>
                                          </div>

                                          <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-semibold uppercase tracking-[0.12em] text-[#c69046]">
                                            {weekDays.map((day) => (
                                              <span key={day} className="py-1">
                                                {day}
                                              </span>
                                            ))}
                                          </div>

                                          <div className="mt-1 grid grid-cols-7 gap-1">
                                            {calendarDays.map((day) => {
                                              const isSelected = selectedDate === day.iso;

                                              return (
                                                <button
                                                  key={day.iso}
                                                  type="button"
                                                  onClick={() =>
                                                    handleRescheduleCalendarSelect(appointment.id, day)
                                                  }
                                                  disabled={day.isDisabled}
                                                  className={`h-8 rounded-full text-[11px] transition ${
                                                    isSelected
                                                      ? "bg-[#f0d59a] font-semibold text-[#24130d]"
                                                      : day.isDisabled
                                                        ? "cursor-not-allowed text-white/22"
                                                        : day.isCurrentMonth
                                                          ? "text-white hover:bg-[#3d2316]"
                                                          : "text-white/48 hover:bg-[#2c1a11]"
                                                  }`}
                                                >
                                                  {day.label}
                                                </button>
                                              );
                                            })}
                                          </div>

                                          <div className="mt-2.5 flex items-center justify-between border-t border-[#8b5d28]/25 pt-2.5 text-[10px] text-white/58">
                                            <span>Lunes no disponible</span>
                                            <button
                                              type="button"
                                              onClick={() => setOpenRescheduleCalendarId(null)}
                                              className="text-[#d7a24e] transition hover:text-[#f0d59a]"
                                            >
                                              Cerrar
                                            </button>
                                          </div>
                                        </div>
                                      ) : null}
                                    </div>
                                  </label>

                                  <label className="grid gap-2">
                                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c69046]">
                                      Nueva hora
                                    </span>
                                    <select
                                      value={selectedTime}
                                      onChange={(event) =>
                                        setRescheduleTime((current) => ({
                                          ...current,
                                          [appointment.id]: event.target.value
                                        }))
                                      }
                                      className="rounded-[16px] border border-[#8b5d28]/30 bg-[#1d100b]/80 px-4 py-3 text-white outline-none transition focus:border-[#c69046]"
                                    >
                                      <option value="">
                                        {loadingSlotsFor === appointment.id
                                          ? "Cargando horarios..."
                                          : availableSlots.length === 0
                                            ? "No hay horas disponibles"
                                            : "Selecciona una hora"}
                                      </option>
                                      {availableSlots.map((slot) => (
                                        <option key={slot} value={slot}>
                                          {slot}
                                        </option>
                                      ))}
                                    </select>
                                  </label>
                                </div>

                                <p className="text-sm leading-6 text-white/68">
                                  La cita mantiene su duración total de {appointment.duracionMinutos} minutos
                                  y terminaría a las{" "}
                                  {selectedTime
                                    ? calculateAppointmentEndTime(selectedTime, appointment.duracionMinutos)
                                    : "--:--"}
                                  .
                                </p>

                                <div className="grid gap-3 sm:flex sm:flex-wrap">
                                  <button
                                    type="button"
                                    onClick={() => handleReschedule(appointment)}
                                    disabled={updatingId === appointment.id}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#c28b32] bg-[linear-gradient(180deg,rgba(60,35,20,0.96),rgba(31,19,12,0.98))] px-5 py-3 font-semibold text-[#f0d59a] disabled:opacity-60 sm:w-auto"
                                  >
                                    <CalendarDays className="h-4 w-4" />
                                    Confirmar nueva fecha
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setExpandedId(null)}
                                    className="inline-flex w-full items-center justify-center rounded-full border border-[#8b5d28]/40 bg-[#24130d]/75 px-5 py-3 text-white/82 sm:w-auto"
                                  >
                                    Cerrar
                                  </button>
                                </div>
                              </div>
                            ) : null}
                          </article>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
