import { siteConfig } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-stone-400 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="font-serif text-xl text-gold">Valhalla Lounge Barber</p>
          <p className="mt-1">Barberia premium con identidad vikinga y reservas online.</p>
        </div>

        <div className="flex flex-col gap-1 text-left lg:text-right">
          <p>{siteConfig.phone}</p>
          <p>{siteConfig.instagram}</p>
          <p>© {new Date().getFullYear()} Valhalla Lounge Barber. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
