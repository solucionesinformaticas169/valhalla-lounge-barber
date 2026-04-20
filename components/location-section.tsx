import { SectionTitle } from "@/components/section-title";
import { siteConfig } from "@/lib/site";

export function LocationSection() {
  return (
    <section id="ubicacion" className="border-t border-white/10">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div>
          <SectionTitle
            eyebrow="Ubicacion y contacto"
            title="Una barberia boutique pensada para destacar"
            description="Informacion clara para reservar, llegar con facilidad y mantener el contacto por los canales principales."
          />

          <div id="contacto" className="mt-10 grid gap-6 text-sm text-stone-300">
            <div>
              <p className="text-stone-500">Direccion</p>
              <p className="mt-2 text-base text-white">{siteConfig.address}</p>
            </div>
            <div>
              <p className="text-stone-500">Telefono</p>
              <p className="mt-2 text-base text-white">{siteConfig.phone}</p>
            </div>
            <div>
              <p className="text-stone-500">Instagram</p>
              <p className="mt-2 text-base text-white">{siteConfig.instagram}</p>
            </div>
            <div>
              <p className="text-stone-500">Horarios</p>
              <div className="mt-2 grid gap-1 text-base text-white">
                {siteConfig.hours.map((hour) => (
                  <p key={hour}>{hour}</p>
                ))}
              </div>
            </div>
            <a
              href={`https://wa.me/${siteConfig.whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex w-fit items-center justify-center rounded-full bg-[#1b7d45] px-6 py-3 font-semibold text-white transition hover:bg-[#209d57]"
            >
              Escribir por WhatsApp
            </a>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6 shadow-glow">
          <div className="grid gap-4 rounded-[1.5rem] border border-gold/15 bg-night/60 p-6">
            <p className="text-sm uppercase tracking-[0.35em] text-gold/75">Mapa / showroom</p>
            <h3 className="font-serif text-3xl text-white">Ubicacion estrategica para una visita premium</h3>
            <p className="text-base leading-7 text-stone-300">
              La seccion queda lista para reemplazar este bloque por Google Maps, mapa embebido o
              integracion de ubicaciones multiples si luego evoluciona a un SaaS multi sede.
            </p>

            <div className="grid gap-4 pt-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Atencion</p>
                <p className="mt-3 text-lg text-white">Asesoria personalizada</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-stone-500">Escalabilidad</p>
                <p className="mt-3 text-lg text-white">Preparado para panel administrativo</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
