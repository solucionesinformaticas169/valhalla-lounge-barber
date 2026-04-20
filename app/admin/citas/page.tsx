import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";

import { AppointmentsList } from "@/app/admin/citas/appointments-list";
import { AdminFilters } from "@/app/admin/citas/admin-filters";
import { getSessionCookieName, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type AdminCitasPageProps = {
  searchParams?: Promise<{
    fecha?: string;
    orden?: string;
  }>;
};

export default async function AdminCitasPage({ searchParams }: AdminCitasPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const cookieStore = await cookies();
  const session = await verifySessionToken(cookieStore.get(getSessionCookieName())?.value);
  const today = new Date().toISOString().split("T")[0];

  if (!session) {
    redirect("/login");
  }

  const selectedDate = resolvedSearchParams.fecha ?? today;
  const selectedOrder = resolvedSearchParams.orden === "desc" ? "desc" : "asc";

  const where = selectedDate
    ? {
        fecha: {
          gte: new Date(`${selectedDate}T00:00:00`),
          lte: new Date(`${selectedDate}T23:59:59`)
        }
      }
    : {};

  const appointments = await prisma.appointment.findMany({
    where,
    orderBy: [{ fecha: "asc" }, { horaInicio: selectedOrder }]
  });

  const serializedAppointments = appointments.map((appointment) => ({
    ...appointment,
    fecha: appointment.fecha.toLocaleDateString("es-EC")
  }));

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#120a06] text-white">
      <div className="relative min-h-screen bg-[radial-gradient(circle_at_center,rgba(180,120,40,0.18),rgba(10,6,4,0.98)_55%)]">
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-screen">
          <Image src="/images/noise.png" alt="Textura" fill className="object-cover" priority />
        </div>

        <section className="mx-auto max-w-[1700px] px-4 pb-12 pt-10 sm:px-6 lg:pt-14">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-[#8f602a]/50 bg-[linear-gradient(180deg,rgba(45,24,14,0.92),rgba(26,14,9,0.96))] px-5 py-3 text-[#e0b766] transition hover:border-[#c28b32]"
            >
              Volver al home
            </Link>

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

              <div className="relative z-10">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-[#b98d49]">Panel admin</p>
                    <h1 className="mt-3 font-serif text-4xl text-[#efc167] sm:text-5xl">
                      Citas registradas
                    </h1>
                    <p className="mt-4 max-w-[60ch] text-white/78">
                      Revisa la agenda, filtra por fecha y ordena por hora para verificar las
                      reservas confirmadas en el sistema.
                    </p>
                  </div>

                  <AdminFilters selectedDate={selectedDate} selectedOrder={selectedOrder} />
                </div>

                <AppointmentsList initialAppointments={serializedAppointments} />
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
