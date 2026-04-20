import { SectionTitle } from "@/components/section-title";
import { testimonials } from "@/lib/site";

export function TestimonialsSection() {
  return (
    <section id="opiniones" className="bg-white/[0.02]">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <SectionTitle
          eyebrow="Opiniones"
          title="Confianza construida con precision y experiencia"
          description="Clientes que valoran puntualidad, resultado y una identidad de marca clara en cada visita."
          align="center"
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.name}
              className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6 shadow-glow"
            >
              <p className="text-lg leading-8 text-stone-200">"{testimonial.quote}"</p>
              <div className="mt-8 border-t border-white/10 pt-5">
                <p className="font-semibold text-white">{testimonial.name}</p>
                <p className="text-sm text-gold/80">{testimonial.role}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
