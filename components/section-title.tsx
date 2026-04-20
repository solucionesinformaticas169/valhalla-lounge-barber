type SectionTitleProps = {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
};

export function SectionTitle({
  eyebrow,
  title,
  description,
  align = "left"
}: SectionTitleProps) {
  const alignment = align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl";

  return (
    <div className={alignment}>
      <p className="text-sm font-semibold uppercase tracking-[0.35em] text-gold/80">{eyebrow}</p>
      <h2 className="mt-4 font-serif text-3xl text-white sm:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-stone-300">{description}</p>
    </div>
  );
}
