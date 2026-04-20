import Image from "next/image";

import { BottomInfoBar } from "@/components/bottom-info-bar";
import { PrimaryButton } from "@/components/primary-button";
import { siteConfig } from "@/lib/site";

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="6" width="16" height="14" rx="2" />
      <path d="M8 3.5v5M16 3.5v5M4 10h16" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 20a8 8 0 1 0-4.2-1.2L4 20l1.4-3.5A8 8 0 0 0 12 20Z" />
      <path d="M9.4 9.3c.4-.8.8-.8 1.1-.8.2 0 .5 0 .7.6.2.6.7 1.9.8 2 .1.2.1.4 0 .6-.1.2-.2.4-.4.5-.2.2-.3.3-.5.5-.2.2-.4.4-.2.7.2.4.9 1.5 2 2.4 1.4 1.1 2.6 1.4 3 1.6.3.1.5.1.7-.1.2-.2.8-.9 1-1.2.2-.3.4-.2.7-.1.3.1 1.8.8 2.1 1 .3.1.5.2.6.4.1.2.1 1-.4 1.9-.5.8-2.8 1.8-3.8 1.8-1 0-2.2-.2-4.8-1.5-3.1-1.5-5.2-5.1-5.4-5.4-.2-.3-1.3-1.8-1.3-3.4 0-1.6.8-2.4 1.1-2.7Z" />
    </svg>
  );
}

function CrestSymbol() {
  return (
    <svg
      viewBox="0 0 420 420"
      className="h-full w-full"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="210" cy="210" r="170" />
      <circle cx="210" cy="210" r="132" />
      <path d="M210 44v332M44 210h332M93 93l234 234M327 93 93 327" />
      <path d="M210 76 238 131 300 139 255 183 264 246 210 219 156 246 165 183 120 139 182 131 210 76Z" />
    </svg>
  );
}

export function Hero() {
  return (
    <section id="inicio" className="relative">
      <div className="valhalla-stage mx-auto max-w-[1420px] px-3 py-3 sm:px-6 sm:py-6 lg:px-10 lg:py-8">
        <div className="valhalla-frame relative overflow-hidden rounded-[30px] border border-[#6f4d2c]/60 bg-[#120c09] shadow-[0_25px_80px_rgba(0,0,0,0.55)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(225,171,82,0.12),transparent_22%),radial-gradient(circle_at_12%_14%,rgba(97,55,27,0.24),transparent_24%),radial-gradient(circle_at_88%_18%,rgba(156,90,43,0.16),transparent_24%),linear-gradient(180deg,rgba(22,15,10,0.26),rgba(10,7,5,0.8))]" />
          <div className="absolute inset-0 opacity-[0.13] [background-image:linear-gradient(180deg,rgba(255,225,180,0.03),transparent_14%,rgba(0,0,0,0.08)_28%,transparent_42%,rgba(255,225,180,0.03)_56%,transparent_70%),linear-gradient(90deg,rgba(255,235,205,0.03),rgba(0,0,0,0.02)_34%,rgba(255,235,205,0.02)_66%,rgba(0,0,0,0.03))]" />
          <div className="absolute inset-[18px] rounded-[24px] border border-[#9c6f3f]/16 shadow-[inset_0_0_80px_rgba(0,0,0,0.5)]" />

          <div className="absolute inset-0 opacity-[0.26] mix-blend-screen">
            <Image
              src="/images/valhalla-home-reference.png"
              alt=""
              fill
              priority
              className="object-cover object-center blur-[2px] saturate-[0.72] brightness-[0.38]"
            />
          </div>

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(216,160,76,0.08),transparent_27%,rgba(0,0,0,0.38)_65%,rgba(0,0,0,0.8)_100%)]" />
          <div className="absolute inset-y-[14%] left-[-2%] w-[34%] rounded-full bg-[radial-gradient(circle_at_34%_48%,rgba(0,0,0,0.04),rgba(0,0,0,0.8)_70%)] blur-md" />
          <div className="absolute inset-y-[10%] right-[-2%] w-[34%] rounded-full bg-[radial-gradient(circle_at_70%_38%,rgba(255,214,162,0.08),rgba(0,0,0,0.78)_72%)] blur-md" />

          <div className="relative flex min-h-[860px] flex-col">
            <div className="relative flex flex-1 items-center justify-center px-5 pb-6 pt-10 sm:px-8 lg:px-16 lg:pt-16">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-[5%] top-[17%] hidden h-[52%] w-[23%] rounded-[40px] bg-[radial-gradient(circle_at_45%_38%,rgba(102,75,52,0.16),rgba(0,0,0,0.64)_62%)] opacity-75 blur-lg lg:block" />
                <div className="absolute left-[7%] top-[23%] hidden h-[230px] w-[94px] rounded-[30px] bg-[linear-gradient(180deg,rgba(81,56,39,0.28),rgba(14,10,8,0.08))] opacity-35 blur-[16px] lg:block" />
                <div className="absolute left-[14%] top-[46%] hidden h-[130px] w-[130px] rotate-[-18deg] rounded-[24px] border border-[#8a6336]/8 bg-[linear-gradient(180deg,rgba(60,42,29,0.12),rgba(0,0,0,0.04))] opacity-25 blur-[12px] lg:block" />
                <div className="absolute left-[8%] top-[60%] hidden h-[18px] w-[200px] rotate-[12deg] rounded-full bg-[linear-gradient(90deg,rgba(120,94,70,0.14),rgba(0,0,0,0.04))] opacity-35 blur-[8px] lg:block" />
                <div className="absolute left-[19%] top-[56%] hidden h-[84px] w-[18px] rotate-[22deg] rounded-full bg-[linear-gradient(180deg,rgba(125,99,72,0.14),rgba(0,0,0,0.04))] opacity-30 blur-[8px] lg:block" />

                <div className="absolute right-[5%] top-[18%] hidden h-[56%] w-[24%] rounded-[40px] bg-[radial-gradient(circle_at_65%_35%,rgba(255,198,126,0.1),rgba(0,0,0,0.64)_64%)] opacity-75 blur-lg lg:block" />
                <div className="absolute right-[12%] top-[53%] hidden h-[144px] w-[144px] rounded-full border border-[#9c7444]/10 bg-[radial-gradient(circle_at_50%_38%,rgba(167,121,67,0.18),rgba(56,38,24,0.08)_36%,rgba(0,0,0,0)_62%)] opacity-30 blur-[12px] lg:block" />
                <div className="absolute right-[9%] top-[42%] hidden h-[192px] w-[84px] rounded-[999px] bg-[radial-gradient(circle_at_50%_18%,rgba(226,221,214,0.18),transparent_36%),radial-gradient(circle_at_50%_58%,rgba(226,221,214,0.1),transparent_52%)] opacity-42 blur-[28px] lg:block" />
                <div className="absolute right-[12%] top-[14%] hidden h-[230px] w-[168px] bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.14),transparent_45%),radial-gradient(circle_at_40%_60%,rgba(255,220,180,0.08),transparent_55%)] opacity-35 blur-[36px] lg:block" />
                <div className="absolute right-[14%] top-[66%] hidden h-[10px] w-[128px] rotate-[34deg] rounded-full bg-[linear-gradient(90deg,rgba(156,156,156,0.18),rgba(0,0,0,0.02))] opacity-24 blur-[6px] lg:block" />
                <div className="absolute right-[9%] top-[69%] hidden h-[10px] w-[110px] rotate-[-44deg] rounded-full bg-[linear-gradient(90deg,rgba(156,156,156,0.16),rgba(0,0,0,0.02))] opacity-22 blur-[6px] lg:block" />
                <div className="absolute right-[10%] top-[24%] hidden h-[250px] w-[180px] bg-[radial-gradient(circle_at_40%_28%,rgba(235,232,228,0.18),transparent_18%),radial-gradient(circle_at_52%_34%,rgba(235,232,228,0.14),transparent_24%),radial-gradient(circle_at_60%_48%,rgba(235,232,228,0.1),transparent_32%),radial-gradient(circle_at_45%_60%,rgba(235,232,228,0.08),transparent_38%)] opacity-42 blur-[36px] lg:block" />
                <div className="absolute right-[8%] top-[16%] hidden h-[160px] w-[160px] rounded-full bg-[radial-gradient(circle,rgba(255,187,102,0.22),rgba(255,187,102,0.08)_32%,transparent_68%)] opacity-75 blur-3xl lg:block" />
              </div>

              <div className="relative z-10 mx-auto flex max-w-[860px] flex-col items-center text-center">
                <div className="relative mb-8 flex h-[290px] w-full items-center justify-center sm:h-[330px] lg:h-[360px]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-[250px] w-[250px] rounded-full bg-[radial-gradient(circle,rgba(220,167,84,0.22),rgba(220,167,84,0.08)_34%,transparent_68%)] blur-3xl sm:h-[280px] sm:w-[280px] lg:h-[320px] lg:w-[320px]" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center text-[#b5884f]">
                    <div className="h-[220px] w-[220px] opacity-[0.12] sm:h-[270px] sm:w-[270px] lg:h-[330px] lg:w-[330px]">
                      <CrestSymbol />
                    </div>
                  </div>

                  <div className="relative z-10 flex flex-col items-center text-[#d8a64b] drop-shadow-[0_8px_24px_rgba(0,0,0,0.65)]">
                    <div className="mb-4 flex items-center gap-4">
                      <div className="h-[72px] w-[72px] rounded-full border border-[#a8783f]/35 bg-[radial-gradient(circle_at_45%_30%,rgba(255,222,167,0.14),rgba(22,14,10,0.2))] sm:h-[88px] sm:w-[88px]" />
                      <div>
                        <h1 className="font-serif text-[56px] leading-[0.92] sm:text-[82px] lg:text-[104px] [text-shadow:0_0_12px_rgba(214,166,84,0.15),0_8px_24px_rgba(0,0,0,0.6)]">
                          Valhalla
                        </h1>
                        <div className="mx-auto mt-2 h-px w-[96%] bg-gradient-to-r from-transparent via-[#b88a49] to-transparent" />
                        <p className="mt-2 font-serif text-[16px] tracking-[0.42em] text-[#f0d9a6] sm:text-[20px] lg:text-[22px]">
                          LOUNGE BARBER
                        </p>
                      </div>
                      <div className="h-[98px] w-[16px] rotate-[24deg] rounded-full border border-[#d0a255]/45 bg-[linear-gradient(180deg,#f1c96f_0%,#a56d27_100%)] shadow-[0_0_18px_rgba(208,162,85,0.25)] sm:h-[126px] sm:w-[18px] lg:h-[160px] lg:w-[20px]" />
                    </div>
                  </div>
                </div>

                <h2 className="max-w-[850px] font-serif text-[34px] leading-tight text-[#e0b260] sm:text-[46px] lg:text-[58px] [text-shadow:0_0_10px_rgba(212,164,87,0.18),0_4px_16px_rgba(0,0,0,0.45)]">
                  Estilo Viking para Hombres Modernos
                </h2>
                <p className="mt-5 max-w-[720px] text-lg leading-8 text-[#e6ddd2] sm:text-[22px] sm:leading-9">
                  Transforma tu look con cortes y afeitados de calidad en un ambiente acogedor.
                </p>

                <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                  <PrimaryButton href="#reservar" variant="gold">
                    <CalendarIcon />
                    <span>Reservar cita</span>
                  </PrimaryButton>
                  <PrimaryButton
                    href={`https://wa.me/${siteConfig.whatsappNumber}`}
                    variant="whatsapp"
                  >
                    <WhatsAppIcon />
                    <span>Agendar por Whatsapp</span>
                  </PrimaryButton>
                </div>
              </div>
            </div>

            <BottomInfoBar />
          </div>
        </div>
      </div>
    </section>
  );
}
