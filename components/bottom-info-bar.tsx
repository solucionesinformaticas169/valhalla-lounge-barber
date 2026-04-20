import { ReactNode } from "react";

import { siteConfig } from "@/lib/site";

function MarkerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#d0aa67]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2.2" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#d0aa67]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.6v4.8l3 2" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#d0aa67]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6.7 4.8h2.2l1.2 3.8-1.5 1.5a15 15 0 0 0 5.3 5.3l1.5-1.5 3.8 1.2v2.2c0 .7-.5 1.3-1.2 1.4-1.4.2-2.8 0-4.2-.4A17.8 17.8 0 0 1 5.7 10c-.5-1.3-.6-2.8-.4-4.2.1-.7.7-1.1 1.4-1.1Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#d0aa67]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <circle cx="12" cy="12" r="3.4" />
      <circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function InfoItem({
  icon,
  text
}: {
  icon: ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 text-[15px] leading-6 text-[#efe7dc]">
      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#b18a51]/35 bg-black/15">
        {icon}
      </span>
      <span>{text}</span>
    </div>
  );
}

export function BottomInfoBar() {
  return (
    <div className="relative mx-3 mt-8 overflow-hidden rounded-[22px] border border-[#9a7340]/38 bg-[linear-gradient(180deg,rgba(47,30,21,0.68)_0%,rgba(30,20,14,0.8)_46%,rgba(23,15,10,0.9)_100%)] px-4 py-5 shadow-[inset_0_1px_0_rgba(255,222,173,0.08),0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-[10px] sm:mx-6 sm:px-6 lg:mx-10 lg:px-8">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,224,173,0.04),transparent_20%,transparent_80%,rgba(255,224,173,0.04))]" />
      <div className="absolute inset-x-[8%] top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(220,170,92,0.8),transparent)]" />
      <div className="grid gap-6 text-sm lg:grid-cols-[1.25fr_1fr_0.7fr] lg:gap-8">
        <div className="relative space-y-3 lg:border-r lg:border-[#9a7340]/28 lg:pr-8">
          <InfoItem icon={<MarkerIcon />} text={`${siteConfig.address} - Cuenca`} />
          <InfoItem icon={<InstagramIcon />} text={siteConfig.instagram} />
        </div>

        <div className="relative space-y-3 lg:border-r lg:border-[#9a7340]/28 lg:px-8">
          <InfoItem icon={<ClockIcon />} text="Mar. a Sab. 9:00 AM - 9:00 PM" />
          <InfoItem icon={<ClockIcon />} text="Dom. 10:00 AM - 3:00 PM" />
        </div>

        <div className="flex items-center lg:justify-end">
          <InfoItem icon={<PhoneIcon />} text={siteConfig.phone} />
        </div>
      </div>
    </div>
  );
}
