"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, LockKeyhole, LogIn, Mail } from "lucide-react";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ identifier, password })
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload.message ?? "No se pudo iniciar sesión.");
        return;
      }

      setMessage(payload.message ?? "Ingreso correcto.");
      window.location.href = payload.redirectTo ?? "/admin/citas";
    } catch {
      setError("Hubo un problema al intentar iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#120a06] text-white">
      <div className="relative min-h-screen bg-[radial-gradient(circle_at_center,rgba(180,120,40,0.18),rgba(10,6,4,0.98)_55%)]">
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-screen">
          <Image src="/images/noise.png" alt="Textura" fill className="object-cover" priority />
        </div>

        <section className="mx-auto max-w-[900px] px-4 pb-12 pt-10 sm:px-6 lg:pt-14">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-[#8f602a]/50 bg-[linear-gradient(180deg,rgba(45,24,14,0.92),rgba(26,14,9,0.96))] px-5 py-3 text-[#e0b766] transition hover:border-[#c28b32]"
            >
              <ChevronLeft className="h-4 w-4" />
              Volver al home
            </Link>
          </div>

          <section className="rounded-[34px] border border-[#5b3c1a]/35 bg-[linear-gradient(180deg,rgba(21,11,7,0.98),rgba(11,6,4,0.98))] p-4 shadow-[0_25px_80px_rgba(0,0,0,0.5)] sm:p-6 lg:p-10">
            <div className="relative overflow-hidden rounded-[28px] border border-[#7c5325]/30 bg-[linear-gradient(180deg,rgba(34,18,12,0.98),rgba(20,10,7,0.98))] p-6 sm:p-8 lg:p-10">
              <div className="pointer-events-none absolute inset-0 opacity-[0.14]">
                <Image src="/images/valhalla-bg.jpg" alt="Fondo" fill className="object-cover" />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(217,157,68,0.14),rgba(0,0,0,0.88)_62%,rgba(0,0,0,0.98)_100%)]" />

              <div className="relative z-10 mx-auto max-w-[560px]">
                <form
                  onSubmit={handleSubmit}
                  className="rounded-[28px] border border-[#8b5d28]/35 bg-[linear-gradient(180deg,rgba(63,33,17,0.72),rgba(36,18,11,0.9))] p-6 sm:p-8"
                >
                  <div className="inline-flex rounded-full border border-[#8e632c]/55 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-[#d7a24e]">
                    Acceso admin
                  </div>
                  <h1 className="mt-6 font-serif text-[clamp(2rem,4.2vw,3.6rem)] leading-[0.98] text-[#efc167]">
                    Ingresa para verificar las citas
                  </h1>
                  <p className="mt-4 text-base leading-8 text-white/82">
                    Accede con tu usuario o correo de administrador para revisar reservas y horarios.
                  </p>

                  <div className="grid gap-5">
                    <label className="grid gap-2">
                      <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#c69046]">
                        <Mail className="h-3.5 w-3.5" />
                        Correo o usuario
                      </span>
                      <input
                        value={identifier}
                        onChange={(event) => setIdentifier(event.target.value)}
                        autoComplete="username"
                        className="rounded-[16px] border border-[#8b5d28]/30 bg-[#24130d]/75 px-4 py-3 text-white outline-none transition focus:border-[#c69046]"
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#c69046]">
                        <LockKeyhole className="h-3.5 w-3.5" />
                        Contraseña
                      </span>
                      <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete="current-password"
                        className="rounded-[16px] border border-[#8b5d28]/30 bg-[#24130d]/75 px-4 py-3 text-white outline-none transition focus:border-[#c69046]"
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-full border border-[#c28b32] bg-[linear-gradient(180deg,rgba(60,35,20,0.96),rgba(31,19,12,0.98))] px-8 py-4 text-lg font-semibold text-[#f0d59a] shadow-[0_0_28px_rgba(194,139,50,0.16)] transition hover:shadow-[0_0_34px_rgba(194,139,50,0.26)] disabled:opacity-60"
                  >
                    <LogIn className="h-5 w-5" />
                    {loading ? "Ingresando..." : "Ingresar"}
                  </button>

                  {error ? <p className="mt-4 text-sm text-[#f0a7a7]">{error}</p> : null}
                  {message ? <p className="mt-4 text-sm text-[#d7c18c]">{message}</p> : null}
                </form>
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
