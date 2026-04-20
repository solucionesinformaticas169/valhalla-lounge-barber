import { SectionTitle } from "@/components/section-title";
import { galleryItems } from "@/lib/site";

export function GallerySection() {
  return (
    <section id="galeria" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
      <SectionTitle
        eyebrow="Galeria"
        title="Un look editorial en cada detalle"
        description="La galeria mezcla presencia visual, textura y acabados para transmitir la identidad de una barberia boutique con inspiracion nordica."
      />

      <div className="mt-12 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="relative min-h-[420px] overflow-hidden rounded-[2rem] border border-white/10 shadow-glow">
          <div
            className="absolute inset-0 bg-[url('/images/valhalla-home-reference.png')] bg-cover bg-no-repeat"
            style={{ backgroundPosition: galleryItems[0].position }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-night via-night/35 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-8">
            <p className="text-sm uppercase tracking-[0.35em] text-gold/80">Signature Cut</p>
            <h3 className="mt-3 font-serif text-3xl text-white">{galleryItems[0].title}</h3>
            <p className="mt-2 text-stone-300">{galleryItems[0].subtitle}</p>
          </div>
        </article>

        <div className="grid gap-6">
          {galleryItems.slice(1).map((item) => (
            <article
              key={item.title}
              className="relative min-h-[198px] overflow-hidden rounded-[2rem] border border-white/10 shadow-glow"
            >
              <div
                className="absolute inset-0 bg-[url('/images/valhalla-home-reference.png')] bg-cover bg-no-repeat"
                style={{ backgroundPosition: item.position }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-night via-night/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="font-serif text-2xl text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-stone-300">{item.subtitle}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
