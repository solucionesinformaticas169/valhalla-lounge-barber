"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CheckCircle2,
  MessageCircle
} from "lucide-react";

import {
  appointmentsOverlap,
  buildAvailableSlots,
  calculateAppointmentDuration,
  calculateAppointmentEndTime,
  getBusinessHours,
  serviceDurations,
  serviceOptions
} from "@/lib/booking";

const whatsappUrl = "https://wa.me/593981926275";
const today = new Date().toISOString().split("T")[0];
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

type CalendarDay = {
  date: Date;
  iso: string;
  label: number;
  isCurrentMonth: boolean;
  isDisabled: boolean;
};

type BookingFormState = {
  nombre: string;
  telefono: string;
  fecha: string;
  horaInicio: string;
};

type BusyAppointment = {
  id: string;
  horaInicio: string;
  horaFin: string;
  serviciosSeleccionados: string[];
  duracionMinutos: number;
};

export default function ServiciosPage() {
  const calendarRef = useRef<HTMLDivElement>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [busyAppointments, setBusyAppointments] = useState<BusyAppointment[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<
    Partial<Record<keyof BookingFormState | "servicio", string>>
  >({});
  const [form, setForm] = useState<BookingFormState>({
    nombre: "",
    telefono: "",
    fecha: "",
    horaInicio: ""
  });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const initial = new Date();
    initial.setDate(1);
    initial.setHours(12, 0, 0, 0);
    return initial;
  });

  const selectedServiceLabels = selectedServices.join(" + ");
  const totalDuration = useMemo(
    () => calculateAppointmentDuration(selectedServices),
    [selectedServices]
  );
  const businessHours = useMemo(() => getBusinessHours(form.fecha), [form.fecha]);
  const baseAvailableSlots = useMemo(
    () => buildAvailableSlots(form.fecha, totalDuration),
    [form.fecha, totalDuration]
  );
  const availableSlots = useMemo(
    () =>
      baseAvailableSlots.filter(
        (slot) =>
          !busyAppointments.some((appointment) =>
            appointmentsOverlap(
              slot,
              totalDuration,
              appointment.horaInicio,
              appointment.duracionMinutos
            )
          )
      ),
    [baseAvailableSlots, busyAppointments, totalDuration]
  );
  const calendarDays = useMemo(() => {
    const firstDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1, 12);
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
      const isCurrentMonth = date.getMonth() === calendarMonth.getMonth();
      const isDisabled = iso < today || date.getDay() === 1;

      return {
        date,
        iso,
        label: date.getDate(),
        isCurrentMonth,
        isDisabled
      } satisfies CalendarDay;
    });
  }, [calendarMonth]);
  const selectedDateLabel = form.fecha
    ? new Intl.DateTimeFormat("es-EC", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      }).format(new Date(`${form.fecha}T12:00:00`))
    : "dd/mm/aaaa";

  useEffect(() => {
    if (!form.fecha || !businessHours) {
      setBusyAppointments([]);
      return;
    }

    let active = true;
    setLoadingSlots(true);

    fetch(`/api/appointments?date=${form.fecha}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("No se pudieron cargar las citas.");
        }

        return response.json();
      })
      .then((payload) => {
        if (!active) return;
        setBusyAppointments(payload.data ?? []);
      })
      .catch(() => {
        if (!active) return;
        setBusyAppointments([]);
      })
      .finally(() => {
        if (active) setLoadingSlots(false);
      });

    return () => {
      active = false;
    };
  }, [form.fecha, businessHours]);

  useEffect(() => {
    if (!calendarOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!calendarRef.current?.contains(event.target as Node)) {
        setCalendarOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [calendarOpen]);

  useEffect(() => {
    if (form.horaInicio && !availableSlots.includes(form.horaInicio)) {
      setForm((current) => ({ ...current, horaInicio: "" }));
    }
  }, [availableSlots, form.horaInicio]);

  useEffect(() => {
    if (!form.fecha) return;

    const selected = new Date(`${form.fecha}T12:00:00`);
    selected.setDate(1);
    setCalendarMonth(selected);
  }, [form.fecha]);

  const toggleService = (serviceName: string) => {
    setSelectedServices((current) =>
      current.includes(serviceName)
        ? current.filter((item) => item !== serviceName)
        : [...current, serviceName]
    );

    setErrors((current) => ({ ...current, servicio: undefined, horaInicio: undefined }));
    setMessage("");
  };

  const handleDateChange = (value: string) => {
    if (!value) {
      setForm((current) => ({ ...current, fecha: "", horaInicio: "" }));
      return;
    }

    const day = new Date(`${value}T12:00:00`).getDay();
    if (day === 1) {
      setForm((current) => ({ ...current, fecha: "", horaInicio: "" }));
      setErrors((current) => ({
        ...current,
        fecha: "La fecha elegida cae en lunes. Selecciona martes, miercoles, jueves, viernes, sabado o domingo."
      }));
      return;
    }

    setForm((current) => ({ ...current, fecha: value, horaInicio: "" }));
    setErrors((current) => ({ ...current, fecha: undefined }));
    setCalendarOpen(false);
  };

  const handleCalendarDaySelect = (day: CalendarDay) => {
    if (day.isDisabled) return;
    handleDateChange(day.iso);
  };

  const shiftCalendarMonth = (direction: -1 | 1) => {
    setCalendarMonth((current) => {
      const next = new Date(current);
      next.setMonth(current.getMonth() + direction);
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Partial<Record<keyof BookingFormState | "servicio", string>> = {};

    if (selectedServices.length === 0) {
      nextErrors.servicio = "Selecciona al menos un servicio.";
    }
    if (form.nombre.trim().length < 3) {
      nextErrors.nombre = "Ingresa un nombre valido.";
    }
    if (!/^[0-9+ ]{8,15}$/.test(form.telefono.trim())) {
      nextErrors.telefono = "Ingresa un telefono valido.";
    }
    if (!form.fecha) {
      nextErrors.fecha = "Selecciona una fecha.";
    }
    if (!form.horaInicio) {
      nextErrors.horaInicio = "Selecciona una hora disponible.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setSubmitState("error");
      setMessage("Revisa los datos del formulario.");
      return;
    }

    setSubmitState("sending");
    setMessage("Confirmando tu reserva...");
    setErrors({});

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...form,
          serviciosSeleccionados: selectedServices
        })
      });

      const payload = await response.json();

      if (!response.ok) {
        setErrors({
          ...payload.errors,
          horaInicio: payload.errors?.horaInicio
        });
        setSubmitState("error");
        setMessage(payload.message ?? "No se pudo completar la reserva.");
        return;
      }

      setBusyAppointments((current) => [...current, payload.data]);
      setSubmitState("success");
      setMessage(payload.message ?? "Reserva registrada con exito.");
      setForm({
        nombre: "",
        telefono: "",
        fecha: "",
        horaInicio: ""
      });
      setSelectedServices([]);
    } catch {
      setSubmitState("error");
      setMessage("Hubo un problema al conectar con el sistema de reservas.");
    }
  };

  const summaryText =
    selectedServices.length === 0 ? "Sin servicios seleccionados" : selectedServiceLabels;
  const endTimeLabel =
    form.horaInicio && totalDuration > 0
      ? calculateAppointmentEndTime(form.horaInicio, totalDuration)
      : null;

  const helperText = errors.fecha
    ? errors.fecha
    : selectedServices.length === 0
      ? "Selecciona uno o varios servicios."
      : !form.fecha
        ? "Selecciona una fecha para ver horarios disponibles."
    : businessHours
      ? businessHours.label
      : "Selecciona una fecha para ver horarios disponibles.";

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
              <MessageCircle className="h-4 w-4" />
              Solicitar por Whatsapp
            </a>
          </div>

          <section className="rounded-[28px] border border-[#5b3c1a]/35 bg-[linear-gradient(180deg,rgba(21,11,7,0.98),rgba(11,6,4,0.98))] p-3 shadow-[0_25px_80px_rgba(0,0,0,0.5)] sm:rounded-[34px] sm:p-6 lg:p-10">
            <div className="relative overflow-hidden rounded-[24px] border border-[#7c5325]/30 bg-[linear-gradient(180deg,rgba(34,18,12,0.98),rgba(20,10,7,0.98))] p-4 sm:rounded-[28px] sm:p-8 lg:p-10">
              <div className="pointer-events-none absolute inset-0 opacity-[0.18]">
                <Image src="/images/valhalla-bg.jpg" alt="Fondo" fill className="object-cover" />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,157,68,0.16),rgba(0,0,0,0.9)_62%,rgba(0,0,0,0.98)_100%)]" />
              <div className="pointer-events-none absolute inset-x-0 top-[10%] flex justify-center opacity-[0.18]">
                <Image
                  src="/images/viking-symbol.png"
                  alt="Simbolo vikingo"
                  width={520}
                  height={520}
                  className="h-auto w-[260px] sm:w-[320px] lg:w-[420px]"
                />
              </div>

              <form onSubmit={handleSubmit} className="relative z-10 mx-auto w-full max-w-[960px]">
                <div className="rounded-[22px] border border-[#8b5d28]/35 bg-[linear-gradient(180deg,rgba(63,33,17,0.72),rgba(36,18,11,0.9))] p-4 sm:rounded-[28px] sm:p-8">
                  <h2 className="font-serif text-[1.75rem] text-[#efc167] sm:text-3xl">Servicios</h2>

                  <div className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-2">
                    {serviceOptions.map((service) => {
                      const active = selectedServices.includes(service);

                      return (
                        <button
                          key={service}
                          type="button"
                          onClick={() => toggleService(service)}
                          aria-pressed={active}
                          className={`rounded-[18px] border px-4 py-3.5 text-left transition sm:py-4 ${
                            active
                              ? "border-[#d7a24e] bg-[linear-gradient(180deg,rgba(110,59,26,0.96),rgba(58,30,17,0.98))] shadow-[0_0_24px_rgba(198,144,70,0.2)]"
                              : "border-[#8b5d28]/30 bg-[#24130d]/75 hover:border-[#a97332]/45 hover:bg-[linear-gradient(180deg,rgba(51,26,15,0.92),rgba(36,18,11,0.96))]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-white sm:text-base">
                              {active ? (
                                <CheckCircle2 className="h-4 w-4 text-[#efc167]" />
                              ) : null}
                              <span className="break-words">{service}</span>
                            </span>
                            <span className="shrink-0 text-sm text-[#d7a24e]">
                              {serviceDurations[service]} min
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {errors.servicio ? (
                    <p className="mt-3 text-sm text-[#f0a7a7]">{errors.servicio}</p>
                  ) : null}

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c69046]">
                        Nombre
                      </span>
                      <input
                        value={form.nombre}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            nombre: event.target.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ ]/g, "")
                          }))
                        }
                        placeholder=""
                        inputMode="text"
                        autoComplete="name"
                        className="rounded-[16px] border border-[#8b5d28]/30 bg-[#24130d]/75 px-4 py-3 text-white outline-none transition focus:border-[#c69046]"
                      />
                      {errors.nombre ? (
                        <span className="text-sm text-[#f0a7a7]">{errors.nombre}</span>
                      ) : null}
                    </label>

                    <label className="grid gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c69046]">
                        Telefono
                      </span>
                      <input
                        value={form.telefono}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            telefono: event.target.value.replace(/\D/g, "").slice(0, 10)
                          }))
                        }
                        placeholder=""
                        inputMode="numeric"
                        autoComplete="tel"
                        maxLength={10}
                        className="rounded-[16px] border border-[#8b5d28]/30 bg-[#24130d]/75 px-4 py-3 text-white outline-none transition focus:border-[#c69046]"
                      />
                      {errors.telefono ? (
                        <span className="text-sm text-[#f0a7a7]">{errors.telefono}</span>
                      ) : null}
                    </label>

                    <label className="grid gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c69046]">
                        Fecha
                      </span>
                      <div ref={calendarRef} className="relative">
                        <button
                          type="button"
                          onClick={() => setCalendarOpen((current) => !current)}
                          className="flex w-full items-center justify-between rounded-[16px] border border-[#8b5d28]/30 bg-[#24130d]/75 px-4 py-3 text-left text-white outline-none transition hover:border-[#a97332]/50 focus:border-[#c69046]"
                          aria-label="Abrir calendario"
                        >
                          <span className={form.fecha ? "text-white" : "text-white/62"}>
                            {selectedDateLabel}
                          </span>
                          <CalendarIcon className="h-5 w-5 text-[#e0b766]" />
                        </button>

                        {calendarOpen ? (
                          <div className="absolute left-0 top-[calc(100%+0.55rem)] z-30 w-full max-w-[280px] rounded-[18px] border border-[#8b5d28]/45 bg-[linear-gradient(180deg,rgba(46,24,14,0.98),rgba(26,14,9,0.98))] p-2.5 shadow-[0_20px_42px_rgba(0,0,0,0.44)] backdrop-blur-xl sm:w-[244px] sm:max-w-none">
                            <div className="mb-3 flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => shiftCalendarMonth(-1)}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#8b5d28]/35 text-[#e0b766] transition hover:border-[#c28b32] hover:text-[#f0d59a]"
                                aria-label="Mes anterior"
                              >
                                <ChevronLeft className="h-3.5 w-3.5" />
                              </button>
                              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#efc167]">
                                {monthNames[calendarMonth.getMonth()]} de {calendarMonth.getFullYear()}
                              </div>
                              <button
                                type="button"
                                onClick={() => shiftCalendarMonth(1)}
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
                                const isSelected = form.fecha === day.iso;
                                return (
                                  <button
                                    key={day.iso}
                                    type="button"
                                    onClick={() => handleCalendarDaySelect(day)}
                                    disabled={day.isDisabled}
                                    className={`h-7 rounded-full text-[11px] transition ${
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
                              {form.fecha ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setForm((current) => ({ ...current, fecha: "", horaInicio: "" }));
                                    setCalendarOpen(false);
                                  }}
                                  className="text-[#d7a24e] transition hover:text-[#f0d59a]"
                                >
                                  Limpiar
                                </button>
                              ) : null}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </label>

                    <label className="grid gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c69046]">
                        Hora
                      </span>
                      <select
                        disabled={selectedServices.length === 0 || !form.fecha || loadingSlots}
                        value={form.horaInicio}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, horaInicio: event.target.value }))
                        }
                        className="rounded-[16px] border border-[#8b5d28]/30 bg-[#24130d]/75 px-4 py-3 text-white outline-none transition focus:border-[#c69046] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="">
                          {selectedServices.length === 0
                            ? "Selecciona uno o mas servicios"
                            : !form.fecha
                              ? "Selecciona una fecha"
                              : loadingSlots
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

                  {errors.fecha ? (
                    <p className="mt-3 text-sm text-[#f0a7a7]">{errors.fecha}</p>
                  ) : null}
                  {errors.horaInicio ? (
                    <p className="mt-3 text-sm text-[#f0a7a7]">{errors.horaInicio}</p>
                  ) : null}

                  <div className="mt-6 rounded-[20px] border border-[#8b5d28]/35 bg-[linear-gradient(180deg,rgba(52,27,15,0.82),rgba(30,15,10,0.9))] p-4 sm:rounded-[22px] sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c69046]">
                          Resumen
                        </div>
                        <div className="mt-2 break-words font-serif text-xl leading-tight text-[#efc167] sm:text-2xl">
                          {summaryText}
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c69046]">
                          Duracion total
                        </div>
                        <div className="mt-2 font-serif text-xl text-[#efc167] sm:text-2xl">
                          {totalDuration > 0 ? `${totalDuration} min` : "-"}
                        </div>
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-white/74 sm:leading-7">{helperText}</p>
                    <p className="mt-2 text-sm leading-6 text-white/58 sm:leading-7">
                      {loadingSlots
                        ? "Cargando horarios ocupados..."
                        : busyAppointments.length > 0
                          ? `Horas reservadas: ${busyAppointments
                              .map((item) => `${item.horaInicio} - ${item.horaFin}`)
                              .join(", ")}`
                          : "Todavia no hay reservas registradas para esa fecha."}
                    </p>
                    {endTimeLabel ? (
                      <p className="mt-2 text-sm leading-6 text-[#d7c18c] sm:leading-7">
                        La cita terminaria a las {endTimeLabel}.
                      </p>
                    ) : null}
                  </div>

                  <button
                    type="submit"
                    disabled={submitState === "sending"}
                    className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-full border border-[#c28b32] bg-[linear-gradient(180deg,rgba(60,35,20,0.96),rgba(31,19,12,0.98))] px-8 py-4 text-lg font-semibold text-[#f0d59a] shadow-[0_0_28px_rgba(194,139,50,0.16)] transition hover:shadow-[0_0_34px_rgba(194,139,50,0.26)] disabled:opacity-60"
                  >
                    <CalendarDays className="h-5 w-5" />
                    {submitState === "sending" ? "Guardando reserva..." : "Confirmar reserva"}
                  </button>

                  {message ? (
                    <p
                      className={`mt-4 text-sm ${
                        submitState === "success" ? "text-[#d7c18c]" : "text-[#f0a7a7]"
                      }`}
                    >
                      {message}
                    </p>
                  ) : null}
                </div>
              </form>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
