import { ReactNode } from "react";

type PrimaryButtonProps = {
  children: ReactNode;
  href: string;
  variant?: "gold" | "whatsapp" | "phone";
};

const styles = {
  gold:
    "border-[#bb8d46] bg-[linear-gradient(180deg,rgba(55,39,24,0.98)_0%,rgba(24,16,11,0.99)_52%,rgba(17,11,8,1)_100%)] text-[#f0d08b] shadow-[inset_0_1px_0_rgba(255,220,160,0.18),inset_0_-1px_0_rgba(0,0,0,0.35),0_12px_26px_rgba(0,0,0,0.35)] hover:border-[#ddb267] hover:text-[#f7ddaa] hover:shadow-[inset_0_1px_0_rgba(255,229,173,0.24),0_0_20px_rgba(214,166,84,0.22),0_12px_30px_rgba(0,0,0,0.42)]",
  whatsapp:
    "border-[#3f6f47] bg-[linear-gradient(180deg,rgba(52,82,45,0.98)_0%,rgba(31,57,29,0.99)_50%,rgba(20,39,20,1)_100%)] text-[#eef6e9] shadow-[inset_0_1px_0_rgba(199,255,201,0.12),inset_0_-1px_0_rgba(0,0,0,0.28),0_12px_26px_rgba(0,0,0,0.35)] hover:border-[#64a06a] hover:bg-[linear-gradient(180deg,rgba(63,100,56,0.99)_0%,rgba(34,67,32,1)_100%)] hover:shadow-[0_0_18px_rgba(83,138,88,0.22),0_12px_30px_rgba(0,0,0,0.42)]",
  phone:
    "border-[#9b7536] bg-[linear-gradient(180deg,rgba(41,28,18,0.95)_0%,rgba(18,12,8,0.98)_100%)] text-[#efcf8d] shadow-[inset_0_1px_0_rgba(255,220,160,0.15),0_8px_18px_rgba(0,0,0,0.3)] hover:border-[#c89e56]"
} as const;

export function PrimaryButton({
  children,
  href,
  variant = "gold"
}: PrimaryButtonProps) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      className={`inline-flex items-center justify-center gap-3 rounded-full border px-7 py-4 text-lg font-semibold transition duration-300 will-change-transform hover:-translate-y-0.5 ${styles[variant]}`}
    >
      {children}
    </a>
  );
}
