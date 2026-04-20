"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

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
  iso: string;
  label: number;
  isCurrentMonth: boolean;
  isDisabled: boolean;
};

type AdminFiltersProps = {
  selectedDate: string;
  selectedOrder: "asc" | "desc";
};

function formatDateLabel(value: string) {
  if (!value) return "dd/mm/aaaa";

  return new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(`${value}T12:00:00`));
}

export function AdminFilters({ selectedDate, selectedOrder }: AdminFiltersProps) {
  const router = useRouter();
  const calendarRef = useRef<HTMLDivElement>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [date, setDate] = useState(selectedDate);
  const [order, setOrder] = useState<"asc" | "desc">(selectedOrder);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const base = selectedDate ? new Date(`${selectedDate}T12:00:00`) : new Date();
    base.setDate(1);
    base.setHours(12, 0, 0, 0);
    return base;
  });

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

      return {
        iso,
        label: date.getDate(),
        isCurrentMonth: date.getMonth() === calendarMonth.getMonth(),
        isDisabled: false
      } satisfies CalendarDay;
    });
  }, [calendarMonth]);

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
    setDate(selectedDate);
    setOrder(selectedOrder);
  }, [selectedDate, selectedOrder]);

  const applyFilters = (nextDate: string, nextOrder: "asc" | "desc") => {
    const params = new URLSearchParams();
    if (nextDate) params.set("fecha", nextDate);
    if (nextOrder !== "asc") params.set("orden", nextOrder);
    const query = params.toString();
    router.push(query ? `/admin/citas?${query}` : "/admin/citas");
  };

  const handleCalendarDaySelect = (day: CalendarDay) => {
    if (day.isDisabled) return;
    setDate(day.iso);
    setCalendarOpen(false);
  };

  const shiftCalendarMonth = (direction: -1 | 1) => {
    setCalendarMonth((current) => {
      const next = new Date(current);
      next.setMonth(current.getMonth() + direction);
      return next;
    });
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        applyFilters(date, order);
      }}
      className="grid gap-3 sm:grid-cols-2"
    >
      <label className="grid gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c69046]">
          Filtrar por fecha
        </span>
        <div ref={calendarRef} className="relative">
          <button
            type="button"
            onClick={() => setCalendarOpen((current) => !current)}
            className="flex w-full items-center justify-between rounded-[16px] border border-[#8b5d28]/30 bg-[#24130d]/75 px-4 py-3 text-left text-white outline-none transition hover:border-[#a97332]/50 focus:border-[#c69046]"
          >
            <span className={date ? "text-white" : "text-white/62"}>{formatDateLabel(date)}</span>
            <CalendarIcon className="h-5 w-5 text-[#e0b766]" />
          </button>

          {calendarOpen ? (
            <div className="absolute left-0 top-[calc(100%+0.55rem)] z-30 w-[244px] rounded-[18px] border border-[#8b5d28]/45 bg-[linear-gradient(180deg,rgba(46,24,14,0.98),rgba(26,14,9,0.98))] p-2.5 shadow-[0_20px_42px_rgba(0,0,0,0.44)] backdrop-blur-xl">
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
                  const isSelected = date === day.iso;
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
                <span>Desde hoy</span>
                {date ? (
                  <button
                    type="button"
                    onClick={() => {
                      setDate("");
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
          Orden por hora
        </span>
        <select
          name="orden"
          value={order}
          onChange={(event) => setOrder(event.target.value as "asc" | "desc")}
          className="rounded-[16px] border border-[#8b5d28]/30 bg-[#24130d]/75 px-4 py-3 text-white outline-none"
        >
          <option value="asc">Ascendente</option>
          <option value="desc">Descendente</option>
        </select>
      </label>

      <div className="sm:col-span-2 flex flex-wrap gap-3">
        <Link
          href="/admin/estadisticas"
          className="inline-flex items-center justify-center rounded-full border border-[#8b5d28]/40 bg-[#24130d]/75 px-6 py-3 text-white/82 transition hover:border-[#c28b32] hover:text-[#f0d59a]"
        >
          Estadísticas
        </Link>
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full border border-[#c28b32] bg-[linear-gradient(180deg,rgba(60,35,20,0.96),rgba(31,19,12,0.98))] px-6 py-3 font-semibold text-[#f0d59a]"
        >
          Aplicar filtros
        </button>
        <button
          type="button"
          onClick={() => {
            setDate("");
            setOrder("asc");
            router.push("/admin/citas");
          }}
          className="inline-flex items-center justify-center rounded-full border border-[#8b5d28]/40 bg-[#24130d]/75 px-6 py-3 text-white/82"
        >
          Limpiar
        </button>
      </div>
    </form>
  );
}
