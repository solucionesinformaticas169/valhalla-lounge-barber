"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Instagram,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Search,
  Sparkles,
  Star,
  X
} from "lucide-react";

const instagramUrl = "https://www.instagram.com/valhallabarberia593/?hl=es";
const mapsUrl =
  "https://www.google.com/maps/search/?api=1&query=Av.+Guapondelig+y+Viracochabamba,+Cuenca";
const whatsappUrl = "https://wa.me/593981926275";
const topNav = [
  { label: "Inicio", href: "#inicio", type: "anchor" },
  { label: "Servicios", href: "/servicios", type: "route" },
  { label: "Galería", href: instagramUrl, type: "external" },
  { label: "Opiniones", href: "#opiniones", type: "anchor" },
  { label: "Ubicación", href: mapsUrl, type: "external" },
  { label: "Contacto", href: "#contacto-footer", type: "anchor" },
  { label: "Login", href: "/login", type: "route" }
] as const;

const testimonials = [
  {
    nombre: "Andrés P.",
    servicio: "Corte de hombre + barba",
    texto:
      "La atención es impecable y el acabado siempre queda fino. Se siente una barbería premium de verdad."
  },
  {
    nombre: "Valeria M.",
    servicio: "Uñas",
    texto:
      "El ambiente es elegante y el trabajo quedó prolijo. Me gustó que respetan los horarios y el detalle."
  },
  {
    nombre: "Diego R.",
    servicio: "Corte de hombre",
    texto:
      "Muy buena experiencia, excelente presentación del lugar y atención profesional de principio a fin."
  }
];

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY;
      const previous = Number(document.body.dataset.lastScrollY || "0");
      setHeaderVisible(current < 64 || current < previous);
      document.body.dataset.lastScrollY = String(current);
    };

    document.body.dataset.lastScrollY = "0";
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (item: (typeof topNav)[number]) => {
    setMenuOpen(false);

    if (item.type === "external") {
      window.open(item.href, "_blank", "noopener,noreferrer");
      return;
    }

    if (item.type === "route") {
      window.location.href = item.href;
      return;
    }

    const target = document.querySelector(item.href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <main
      id="inicio"
      className="min-h-screen overflow-x-hidden bg-[#120a06] text-white"
      onClick={() => setMenuOpen(false)}
    >
      <div className="relative min-h-screen bg-[radial-gradient(circle_at_center,rgba(180,120,40,0.18),rgba(10,6,4,0.98)_55%)]">
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-screen">
          <Image src="/images/noise.png" alt="Textura" fill className="object-cover" priority />
        </div>

        <header
          className={`fixed inset-x-0 top-0 z-50 transition-transform duration-300 ${
            headerVisible ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <div className="mx-auto max-w-[1700px] px-3 pt-3 sm:px-6">
            <div
              className="rounded-[28px] border border-[#7a5222]/40 bg-[linear-gradient(180deg,rgba(38,21,12,0.96),rgba(18,10,6,0.98))] px-4 py-4 shadow-[0_0_0_1px_rgba(201,146,61,0.08),0_10px_40px_rgba(0,0,0,0.45)] sm:px-6 lg:px-8"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="flex items-center gap-3 text-left"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#9b6a2c]/60 text-2xl font-serif text-[#d4a44b]">
                    V
                  </span>
                  <span>
                    <span className="block font-serif text-[clamp(1.5rem,2.2vw,3rem)] leading-none text-[#d8ab58]">
                      Valhalla
                    </span>
                    <span className="mt-1 block text-[10px] tracking-[0.35em] text-[#d2b27a]/85 sm:text-sm">
                      LOUNGE BARBER
                    </span>
                  </span>
                </button>

                <nav className="hidden items-center gap-10 font-serif text-[17px] text-[#dbc08d] lg:flex">
                  {topNav.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleNavClick(item)}
                      className="transition hover:text-[#f0d59a]"
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>

                <div className="flex items-center gap-3">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hidden items-center gap-3 rounded-full border border-[#a26d2f]/70 bg-[linear-gradient(180deg,#2e1b10,#1a110c)] px-6 py-3.5 text-[#e0b766] shadow-[0_0_20px_rgba(212,146,61,0.08)] lg:inline-flex"
                  >
                    <Phone className="h-5 w-5" />
                    <span className="text-xl font-semibold">098 192 6275</span>
                  </a>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-full border border-[#a26d2f]/70 bg-[linear-gradient(180deg,#2e1b10,#1a110c)] p-3 text-[#e0b766] lg:hidden"
                  >
                    <Phone className="h-5 w-5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setMenuOpen((current) => !current)}
                    className="inline-flex items-center justify-center rounded-full border border-[#a26d2f]/70 bg-[linear-gradient(180deg,#2e1b10,#1a110c)] p-3 text-[#e0b766] lg:hidden"
                  >
                    {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {menuOpen ? (
                <div className="mt-4 rounded-[24px] border border-[#7a5222]/35 bg-[#1a0f0a]/95 p-4 lg:hidden">
                  <div className="grid gap-2">
                    {topNav.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => handleNavClick(item)}
                        className="rounded-2xl border border-transparent px-4 py-3 text-left font-serif text-[#dbc08d] transition hover:border-[#7a5222]/40 hover:bg-[#24140d]"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-[1700px] px-3 pb-12 pt-28 sm:px-6 sm:pt-32 lg:pt-36">
          <div className="rounded-[34px] border border-[#5b3c1a]/35 bg-[linear-gradient(180deg,rgba(21,11,7,0.98),rgba(11,6,4,0.98))] p-4 shadow-[0_25px_80px_rgba(0,0,0,0.5)] sm:p-6 lg:p-10">
            <section className="relative overflow-visible rounded-[28px] border border-white/10 bg-black/60 px-4 pb-20 pt-10 sm:overflow-hidden sm:px-6 sm:pb-44 lg:px-10 lg:pb-52 lg:pt-12">
              <div className="absolute inset-0 opacity-[0.22]">
                <Image src="/images/valhalla-bg.jpg" alt="Fondo" fill className="object-cover" />
              </div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(229,171,77,0.22),rgba(0,0,0,0.88)_58%,rgba(0,0,0,0.96)_100%)]" />
              <div className="absolute inset-x-0 top-[14%] flex justify-center opacity-[0.42]">
                <Image
                  src="/images/viking-symbol.png"
                  alt="Símbolo vikingo"
                  width={560}
                  height={560}
                  className="h-auto w-[340px] brightness-[1.18] sm:w-[440px] lg:w-[540px]"
                />
              </div>
              <div className="absolute inset-x-0 top-[9%] flex justify-center">
                <div className="h-[220px] w-[220px] rounded-full bg-[radial-gradient(circle,rgba(225,165,72,0.34),transparent_70%)] blur-3xl sm:h-[280px] sm:w-[280px] lg:h-[360px] lg:w-[360px]" />
              </div>
              <div className="absolute left-[4%] top-[18%] hidden opacity-[0.66] [mask-image:linear-gradient(to_bottom,transparent_0%,black_26%,black_74%,transparent_100%)] lg:block">
                <Image
                  src="/images/barber-left-tools.png"
                  alt="Herramientas"
                  width={360}
                  height={300}
                  className="h-auto w-[360px] object-contain brightness-[1.12] blur-[0.4px]"
                />
              </div>
              <div className="absolute right-[4%] top-[18%] hidden opacity-[0.68] [mask-image:linear-gradient(to_bottom,transparent_0%,black_26%,black_74%,transparent_100%)] lg:block">
                <Image
                  src="/images/barber-right-bowl.png"
                  alt="Bowl"
                  width={360}
                  height={300}
                  className="h-auto w-[360px] object-contain brightness-[1.12] blur-[0.4px]"
                />
              </div>

              <div className="relative z-10 mx-auto mt-24 flex max-w-[980px] flex-col items-center pb-24 text-center sm:mt-20 sm:pb-0 lg:mt-24">
                <Image
                  src="/images/valhalla-logo-main.png"
                  alt="Valhalla Lounge Barber"
                  width={760}
                  height={320}
                  className="h-auto w-[220px] max-w-full -translate-y-24 transform sm:w-[460px] sm:-translate-y-48 lg:w-[620px] lg:-translate-y-56"
                  priority
                />
                <p className="mt-20 max-w-[880px] text-[clamp(1.08rem,1.7vw,1.55rem)] leading-[1.6] text-[#e2b45e] sm:mt-10 lg:-mt-40">
                  Transforma tu look con cortes y afeitados de calidad en un ambiente acogedor.
                </p>
                <div className="mt-16 flex w-full flex-col items-center gap-4 sm:mt-10 sm:flex-row sm:justify-center lg:mt-7">
                  <a
                    href="/servicios"
                    className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-[#c28b32] bg-[linear-gradient(180deg,rgba(60,35,20,0.96),rgba(31,19,12,0.98))] px-10 py-4 text-lg font-semibold text-[#f0d59a] shadow-[0_0_30px_rgba(194,139,50,0.18)] transition hover:shadow-[0_0_36px_rgba(194,139,50,0.28)] sm:w-auto"
                  >
                    <CalendarDays className="h-5 w-5" />
                    Reservar cita
                  </a>
                  <a
                    href="/reservas"
                    className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-[#c28b32] bg-[linear-gradient(180deg,rgba(60,35,20,0.96),rgba(31,19,12,0.98))] px-10 py-4 text-lg font-semibold text-[#f0d59a] shadow-[0_0_30px_rgba(194,139,50,0.18)] transition hover:shadow-[0_0_36px_rgba(194,139,50,0.28)] sm:w-auto"
                  >
                    <Search className="h-5 w-5" />
                    Consulta tu cita
                  </a>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-[#477634] bg-[linear-gradient(180deg,#35692f,#234c21)] px-10 py-4 text-lg font-semibold text-white shadow-[0_0_28px_rgba(66,128,56,0.2)] transition hover:shadow-[0_0_36px_rgba(66,128,56,0.3)] sm:w-auto"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Agendar por Whatsapp
                  </a>
                </div>
              </div>

              <div
                id="contacto-footer"
                className="relative inset-x-[4%] z-20 mx-[4%] mt-4 rounded-[28px] border border-[#8b5d28]/45 bg-[linear-gradient(180deg,rgba(55,28,14,0.88),rgba(33,17,10,0.92))] backdrop-blur-md shadow-[0_20px_40px_rgba(0,0,0,0.45)] scroll-mt-24 lg:absolute lg:bottom-5 lg:mx-0 lg:mt-0"
              >
                <div className="grid grid-cols-1 md:grid-cols-3">
                  <div className="flex flex-col gap-4 px-6 py-6 text-white/92 sm:px-8">
                    <a href={mapsUrl} target="_blank" rel="noreferrer" className="flex items-center gap-4 transition hover:text-[#efc167]">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#9d6a2f]/50 text-[#d4a44b]">
                        <MapPin className="h-5 w-5" />
                      </span>
                      <span className="text-[1rem] sm:text-[1.08rem]">Av. Guapondelig y Viracochabamba - Cuenca</span>
                    </a>
                    <a href={instagramUrl} target="_blank" rel="noreferrer" className="flex items-center gap-4 transition hover:text-[#efc167]">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#9d6a2f]/50 text-[#d4a44b]">
                        <Instagram className="h-5 w-5" />
                      </span>
                      <span className="text-[1rem] sm:text-[1.08rem]">@valhallabarberia593</span>
                    </a>
                  </div>

                  <div className="flex flex-col gap-4 border-y border-[#8b5d28]/35 px-6 py-6 text-white/92 sm:px-8 md:border-x md:border-y-0">
                    <div className="flex items-center gap-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#9d6a2f]/50 text-[#d4a44b]">
                        <Clock3 className="h-5 w-5" />
                      </span>
                      <span className="text-[1rem] sm:text-[1.08rem]">Mar. a Sab. 9:00 AM - 9:00 PM</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#9d6a2f]/50 text-[#d4a44b]">
                        <Clock3 className="h-5 w-5" />
                      </span>
                      <span className="text-[1rem] sm:text-[1.08rem]">Dom. 10:00 AM - 3:00 PM</span>
                    </div>
                  </div>

                  <a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center px-6 py-6 text-white/95 transition hover:bg-white/[0.02] sm:px-8">
                    <div className="flex items-center gap-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#9d6a2f]/50 text-[#d4a44b]">
                        <Phone className="h-5 w-5" />
                      </span>
                      <span className="text-[1.05rem] sm:text-[1.12rem]">098 192 6275</span>
                    </div>
                  </a>
                </div>
              </div>
            </section>

            <section id="servicios" className="mt-8 rounded-[28px] border border-[#6f4720]/35 bg-[#140b08]/92 p-6 scroll-mt-32 sm:p-8">
              <p className="text-sm uppercase tracking-[0.35em] text-[#b98d49]">Servicios</p>
              <h2 className="mt-3 font-serif text-4xl text-[#efc167] sm:text-5xl">
                Barbería y cuidado estético
              </h2>
              <div className="mt-8 grid gap-4 lg:grid-cols-3">
                {[
                  {
                    title: "Cortes Premium",
                    body: "Corte de hombre y corte de mujer con acabado preciso, forma y estilo cuidado."
                  },
                  {
                    title: "Barba y Ritual",
                    body: "Perfilado y definición de barba para complementar el look con detalle."
                  },
                  {
                    title: "Uñas y Cuidado",
                    body: "Servicio de uñas con presentación elegante y atención detallada."
                  }
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[24px] border border-[#6f4720]/35 bg-[linear-gradient(180deg,rgba(53,29,17,0.65),rgba(18,10,7,0.96))] p-6"
                  >
                    <div className="flex items-center gap-3 text-[#d4a44b]">
                      <Sparkles className="h-5 w-5" />
                      <span className="text-sm uppercase tracking-[0.3em]">Valhalla</span>
                    </div>
                    <h3 className="mt-4 font-serif text-3xl text-[#efc167]">{item.title}</h3>
                    <p className="mt-4 leading-7 text-white/72">{item.body}</p>
                  </div>
                ))}
              </div>
            </section>

            <section id="opiniones" className="mt-8 rounded-[28px] border border-[#6f4720]/35 bg-[#140b08]/92 p-6 scroll-mt-32 sm:p-8">
              <p className="text-sm uppercase tracking-[0.35em] text-[#b98d49]">Opiniones</p>
              <h2 className="mt-3 font-serif text-4xl text-[#efc167] sm:text-5xl">
                Lo que dicen nuestros clientes
              </h2>
              <div className="mt-8 grid gap-4 lg:grid-cols-3">
                {testimonials.map((item) => (
                  <article
                    key={item.nombre}
                    className="rounded-[24px] border border-[#6f4720]/35 bg-[linear-gradient(180deg,rgba(53,29,17,0.65),rgba(18,10,7,0.96))] p-6"
                  >
                    <div className="flex gap-1 text-[#e0b766]">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <p className="mt-4 leading-7 text-white/78">“{item.texto}”</p>
                    <div className="mt-6">
                      <div className="font-serif text-2xl text-[#efc167]">{item.nombre}</div>
                      <div className="mt-1 text-sm tracking-[0.2em] text-[#b98d49]">{item.servicio}</div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <div className="mt-8 px-2 text-center text-sm text-[#d2b27a]/78">
              © 2026{" "}
              <a
                href="https://www.solucionesinformaticas.dev"
                target="_blank"
                rel="noreferrer"
                className="text-[#efc167] transition hover:text-[#f0d59a]"
              >
                Soluciones Informáticas
              </a>{" "}
              Todos los derechos reservados.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
