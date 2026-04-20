import { navigation, siteConfig } from "@/lib/site";
import { PrimaryButton } from "@/components/primary-button";

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6.7 4.8h2.2l1.2 3.8-1.5 1.5a15 15 0 0 0 5.3 5.3l1.5-1.5 3.8 1.2v2.2c0 .7-.5 1.3-1.2 1.4-1.4.2-2.8 0-4.2-.4A17.8 17.8 0 0 1 5.7 10c-.5-1.3-.6-2.8-.4-4.2.1-.7.7-1.1 1.4-1.1Z" />
    </svg>
  );
}

export function Header() {
  return (
    <div className="relative z-20 px-3 pt-3 sm:px-5 sm:pt-5 lg:px-8 lg:pt-8">
      <header className="relative overflow-hidden rounded-[24px] border border-[#6f4d2c]/55 bg-[linear-gradient(180deg,rgba(26,18,13,0.95)_0%,rgba(17,11,8,0.99)_100%)] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,224,180,0.06),0_12px_34px_rgba(0,0,0,0.35)] sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,227,184,0.03),transparent_18%,transparent_82%,rgba(255,227,184,0.03))]" />
        <div className="flex items-center justify-between gap-4">
          <a href="#inicio" className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#a87b3d]/40 bg-[#1f140e] text-[#d7a750] shadow-[inset_0_1px_0_rgba(255,224,180,0.08)]">
                <span className="font-serif text-2xl leading-none">V</span>
              </div>
              <div className="min-w-0">
                <p className="truncate font-serif text-[24px] leading-none text-[#d6a348] sm:text-[28px]">
                  Valhalla
                </p>
                <p className="mt-1 truncate text-[10px] uppercase tracking-[0.42em] text-[#d5c1a3] sm:text-[11px]">
                  Lounge Barber
                </p>
              </div>
            </div>
          </a>

          <nav className="hidden items-center gap-8 lg:flex">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="font-serif text-[19px] text-[#d7c1a1] transition hover:text-[#efca83]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden lg:block">
            <PrimaryButton href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`} variant="phone">
              <PhoneIcon />
              <span>{siteConfig.phone}</span>
            </PrimaryButton>
          </div>

          <a
            href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#9c7239]/55 bg-[#20150e] text-[#ddb261] lg:hidden"
          >
            <PhoneIcon />
          </a>
        </div>

        <nav className="mt-4 flex gap-3 overflow-x-auto pb-1 lg:hidden">
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-full border border-[#7a5831]/40 bg-[#1a120d]/85 px-4 py-2 font-serif text-base text-[#d6c0a0]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="absolute inset-x-[12%] bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(226,177,89,0.92),transparent)]" />
        <div className="absolute inset-x-[18%] -bottom-[2px] h-[10px] bg-[radial-gradient(ellipse_at_center,rgba(226,177,89,0.28),transparent_70%)] blur-md" />
      </header>
    </div>
  );
}
