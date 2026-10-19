import { Link } from "@tanstack/react-router";

export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="18" fill="var(--burgundy)" />
      <path d="M16 44V22l16 14 16-14v22" fill="none" stroke="var(--cream)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="47" cy="17" r="4.5" fill="var(--blush)" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 rounded-lg py-1" aria-label="MiniGains — inicio">
      <LogoMark />
      <span className="font-display text-[1.35rem] leading-none tracking-tight">
        Mini<em className="font-normal italic text-primary">Gains</em>
      </span>
    </Link>
  );
}