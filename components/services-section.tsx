import { SectionTitle } from "@/components/section-title";
import { services } from "@/lib/site";

export function ServicesSection() {
  return (
    <section id="servicios" className="border-y border-white/10 bg-white/[0.02]">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <SectionTitle
          eyebrow="Servicios"
          title="Rituales de barberia con ejecucion de alto nivel"
          description="Cada servicio fue pensado para proyectar presencia, cuidado y estilo con una estetica sofisticada y masculina."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {services.map((service) => (
            <article
              key={service.name}
              className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 shadow-glow"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-serif text-2xl text-white">{service.name}</h3>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-stone-300">
                    {service.description}
                  </p>
                </div>
                <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-sm font-semibold text-gold">
                  {service.price}
                </span>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-sm text-stone-400">
                <span>Duracion estimada</span>
                <span className="font-medium text-white">{service.duration}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
