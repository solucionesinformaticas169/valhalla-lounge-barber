import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BarChart3, CalendarDays, CheckCircle2, Clock3, LogOut, XCircle } from "lucide-react";

import { getSessionCookieName, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type EstadisticasPageProps = {
  searchParams?: Promise<{
    desde?: string;
    hasta?: string;
  }>;
};

function toIsoDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDateRange(from?: string, to?: string) {
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  const fallback = toIsoDate(today);
  const desde = from && /^\d{4}-\d{2}-\d{2}$/.test(from) ? from : fallback;
  const hasta = to && /^\d{4}-\d{2}-\d{2}$/.test(to) ? to : desde;

  const normalizedFrom = desde <= hasta ? desde : hasta;
  const normalizedTo = hasta >= desde ? hasta : desde;

  return {
    desde: normalizedFrom,
    hasta: normalizedTo
  };
}

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(`${value}T12:00:00`));
}

export default async function EstadisticasPage({ searchParams }: EstadisticasPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const cookieStore = await cookies();
  const session = await verifySessionToken(cookieStore.get(getSessionCookieName())?.value);

  if (!session) {
    redirect("/login");
  }

  const range = getDateRange(resolvedSearchParams.desde, resolvedSearchParams.hasta);
  const startDate = new Date(`${range.desde}T00:00:00`);
  const endDate = new Date(`${range.hasta}T23:59:59.999`);

  const appointments = await prisma.appointment.findMany({
    where: {
      fecha: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: [{ fecha: "asc" }, { horaInicio: "asc" }],
    select: {
      id: true,
      nombre: true,
      fecha: true,
      horaInicio: true,
      horaFin: true,
      estado: true,
      serviciosSeleccionados: true
    }
  });

  const attendedCount = appointments.filter((appointment) => appointment.estado === "ATENDIDO").length;
  const unattendedCount = appointments.filter((appointment) => appointment.estado === "NO_ATENDIDO").length;
  const pendingCount = appointments.filter((appointment) => appointment.estado === "PENDIENTE").length;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#120a06] text-white">
      <div className="relative min-h-screen bg-[radial-gradient(circle_at_center,rgba(180,120,40,0.18),rgba(10,6,4,0.98)_55%)]">
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-screen">
          <Image src="/images/noise.png" alt="Textura" fill className="object-cover" priority />
        </div>

        <section className="mx-auto max-w-[1700px] px-4 pb-12 pt-10 sm:px-6 lg:pt-14">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/citas"
                className="inline-flex items-center gap-2 rounded-full border border-[#8f602a]/50 bg-[linear-gradient(180deg,rgba(45,24,14,0.92),rgba(26,14,9,0.96))] px-5 py-3 text-[#e0b766] transition hover:border-[#c28b32]"
              >
                Volver a citas
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-[#8f602a]/50 bg-[linear-gradient(180deg,rgba(45,24,14,0.92),rgba(26,14,9,0.96))] px-5 py-3 text-[#e0b766] transition hover:border-[#c28b32]"
              >
                Volver al home
              </Link>
            </div>

            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full border border-[#8f602a]/50 bg-[linear-gradient(180deg,rgba(45,24,14,0.92),rgba(26,14,9,0.96))] px-5 py-3 text-[#e0b766] transition hover:border-[#c28b32]"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </button>
            </form>
          </div>

          <section className="rounded-[34px] border border-[#5b3c1a]/35 bg-[linear-gradient(180deg,rgba(21,11,7,0.98),rgba(11,6,4,0.98))] p-4 shadow-[0_25px_80px_rgba(0,0,0,0.5)] sm:p-6 lg:p-10">
            <div className="relative overflow-hidden rounded-[28px] border border-[#7c5325]/30 bg-[linear-gradient(180deg,rgba(34,18,12,0.98),rgba(20,10,7,0.98))] p-6 sm:p-8 lg:p-10">
              <div className="pointer-events-none absolute inset-0 opacity-[0.14]">
                <Image src="/images/valhalla-bg.jpg" alt="Fondo" fill className="object-cover" />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,157,68,0.14),rgba(0,0,0,0.88)_62%,rgba(0,0,0,0.98)_100%)]" />

              <div className="relative z-10 space-y-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-[#b98d49]">Panel admin</p>
                    <h1 className="mt-3 font-serif text-4xl text-[#efc167] sm:text-5xl">
                      Estadísticas de atención
                    </h1>
                    <p className="mt-4 max-w-[60ch] text-white/78">
                      Consulta cuántas citas fueron atendidas o no atendidas dentro del rango
                      de fechas que elijas.
                    </p>
                  </div>

                  <form className="grid gap-3 sm:grid-cols-2 lg:min-w-[480px]" method="get">
                    <label className="grid gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c69046]">
                        Desde
                      </span>
                      <input
                        type="date"
                        name="desde"
                        defaultValue={range.desde}
                        className="rounded-[16px] border border-[#8b5d28]/30 bg-[#24130d]/75 px-4 py-3 text-white outline-none"
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c69046]">
                        Hasta
                      </span>
                      <input
                        type="date"
                        name="hasta"
                        defaultValue={range.hasta}
                        className="rounded-[16px] border border-[#8b5d28]/30 bg-[#24130d]/75 px-4 py-3 text-white outline-none"
                      />
                    </label>

                    <div className="sm:col-span-2 flex flex-wrap gap-3">
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-full border border-[#c28b32] bg-[linear-gradient(180deg,rgba(60,35,20,0.96),rgba(31,19,12,0.98))] px-6 py-3 font-semibold text-[#f0d59a]"
                      >
                        Ver estadísticas
                      </button>
                      <Link
                        href="/admin/estadisticas"
                        className="inline-flex items-center justify-center rounded-full border border-[#8b5d28]/40 bg-[#24130d]/75 px-6 py-3 text-white/82 transition hover:border-[#c28b32] hover:text-[#f0d59a]"
                      >
                        Limpiar
                      </Link>
                    </div>
                  </form>
                </div>

                <div className="grid gap-4 lg:grid-cols-4">
                  <article className="rounded-[24px] border border-[#8b5d28]/35 bg-[linear-gradient(180deg,rgba(56,31,18,0.88),rgba(28,15,9,0.92))] p-6">
                    <div className="flex items-center gap-3 text-[#efc167]">
                      <BarChart3 className="h-5 w-5" />
                      <span className="text-sm uppercase tracking-[0.2em]">Total citas</span>
                    </div>
                    <p className="mt-4 text-4xl font-semibold text-white">{appointments.length}</p>
                    <p className="mt-3 text-sm text-white/65">
                      Del {formatDateLabel(range.desde)} al {formatDateLabel(range.hasta)}
                    </p>
                  </article>

                  <article className="rounded-[24px] border border-[#8b5d28]/35 bg-[linear-gradient(180deg,rgba(56,31,18,0.88),rgba(28,15,9,0.92))] p-6">
                    <div className="flex items-center gap-3 text-[#efc167]">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-sm uppercase tracking-[0.2em]">Atendidos</span>
                    </div>
                    <p className="mt-4 text-4xl font-semibold text-[#f0d59a]">{attendedCount}</p>
                    <p className="mt-3 text-sm text-white/65">Citas marcadas como atendidas.</p>
                  </article>

                  <article className="rounded-[24px] border border-[#8b5d28]/35 bg-[linear-gradient(180deg,rgba(56,31,18,0.88),rgba(28,15,9,0.92))] p-6">
                    <div className="flex items-center gap-3 text-[#efc167]">
                      <XCircle className="h-5 w-5" />
                      <span className="text-sm uppercase tracking-[0.2em]">No atendidos</span>
                    </div>
                    <p className="mt-4 text-4xl font-semibold text-[#ffcdc4]">{unattendedCount}</p>
                    <p className="mt-3 text-sm text-white/65">Citas marcadas como no atendidas.</p>
                  </article>

                  <article className="rounded-[24px] border border-[#8b5d28]/35 bg-[linear-gradient(180deg,rgba(56,31,18,0.88),rgba(28,15,9,0.92))] p-6">
                    <div className="flex items-center gap-3 text-[#efc167]">
                      <Clock3 className="h-5 w-5" />
                      <span className="text-sm uppercase tracking-[0.2em]">Pendientes</span>
                    </div>
                    <p className="mt-4 text-4xl font-semibold text-white">{pendingCount}</p>
                    <p className="mt-3 text-sm text-white/65">Citas que aún no tienen resultado.</p>
                  </article>
                </div>

                <section className="overflow-hidden rounded-[24px] border border-[#8b5d28]/35 bg-[linear-gradient(180deg,rgba(53,29,17,0.65),rgba(18,10,7,0.96))]">
                  <div className="flex items-center gap-3 border-b border-[#8b5d28]/20 px-6 py-4 text-[#efc167]">
                    <CalendarDays className="h-5 w-5" />
                    <h2 className="font-semibold uppercase tracking-[0.18em]">
                      Detalle del rango consultado
                    </h2>
                  </div>

                  {appointments.length === 0 ? (
                    <div className="px-6 py-8 text-white/72">
                      No hay citas registradas en el rango de fechas seleccionado.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-px bg-[#8b5d28]/20">
                      {appointments.map((appointment) => (
                        <article
                          key={appointment.id}
                          className="grid gap-4 bg-[#1c100b] px-6 py-5 lg:grid-cols-[1.2fr_0.9fr_1fr]"
                        >
                          <div>
                            <p className="font-semibold text-white">{appointment.nombre}</p>
                            <p className="mt-2 text-white/72">
                              {appointment.serviciosSeleccionados.join(" + ")}
                            </p>
                          </div>

                          <div className="text-white/78">
                            <p>{appointment.fecha.toLocaleDateString("es-EC")}</p>
                            <p className="mt-2">
                              {appointment.horaInicio} - {appointment.horaFin}
                            </p>
                          </div>

                          <div className="text-white/82">
                            <span className="text-[#c69046]">Estado:</span>{" "}
                            <span
                              className={
                                appointment.estado === "ATENDIDO"
                                  ? "text-[#f0d59a]"
                                  : appointment.estado === "NO_ATENDIDO"
                                    ? "text-[#ffcdc4]"
                                    : "text-white"
                              }
                            >
                              {appointment.estado}
                            </span>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
