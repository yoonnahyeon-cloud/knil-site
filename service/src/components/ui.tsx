import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";

// Small shared pieces for the signed-in screens.

export function PageTitle({ children, sub, icon }: { children: React.ReactNode; sub?: React.ReactNode; icon?: LucideIcon }) {
  return (
    <div className="flex items-start gap-3 pt-6 pb-5">
      {icon && <IconTile icon={icon} tone="ink" size={44} />}
      <div className="min-w-0">
        <h1 className="text-[24px] font-extrabold leading-tight tracking-[-0.04em]">{children}</h1>
        {sub && <p className="mt-1 text-[14px] text-mute">{sub}</p>}
      </div>
    </div>
  );
}

export function SectionHead({ title, more, icon }: { title: string; more?: { href: string; label?: string }; icon?: LucideIcon }) {
  const Icon = icon;
  return (
    <div className="mt-9 mb-3 flex items-center justify-between">
      <h2 className="flex items-center gap-1.5 text-[18px] font-extrabold tracking-tight">
        {Icon && <Icon size={19} className="text-signal" strokeWidth={2.2} />}
        {title}
      </h2>
      {more && (
        <Link href={more.href} className="flex items-center text-[13px] text-mute">
          {more.label ?? "더보기"}
          <ChevronRight size={15} />
        </Link>
      )}
    </div>
  );
}

export function Soon({ className = "" }: { className?: string }) {
  return <span className={`inline-block rounded-full bg-soft px-2 py-0.5 text-[11px] font-bold text-signal ${className}`}>준비 중</span>;
}

export function Empty({ title, body, icon, children }: { title: string; body?: string; icon?: LucideIcon; children?: React.ReactNode }) {
  const Icon = icon;
  return (
    <div className="rounded-3xl bg-surface px-6 py-12 text-center">
      {Icon && (
        <span className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-white text-signal shadow-sm">
          <Icon size={26} />
        </span>
      )}
      <p className="font-bold">{title}</p>
      {body && <p className="mt-1 text-[14px] text-mute">{body}</p>}
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}

const TONES = {
  purple: "bg-signal text-white",
  ink: "bg-ink text-white",
  soft: "bg-soft text-signal",
  gray: "bg-surface text-ink",
  pink: "bg-[#e07a98] text-white",
  mint: "bg-[#7a9a7c] text-white",
  sky: "bg-[#6b7c9f] text-white",
  amber: "bg-[#c9995a] text-white",
};
export type Tone = keyof typeof TONES;

// A rounded square with an icon in it, the main visual marker of every list.
export function IconTile({ icon: Icon, tone = "soft", size = 40 }: { icon: LucideIcon; tone?: Tone; size?: number }) {
  return (
    <span className={`grid shrink-0 place-items-center ${TONES[tone]}`} style={{ width: size, height: size, borderRadius: size * 0.32 }}>
      <Icon size={size * 0.5} strokeWidth={2} />
    </span>
  );
}

// A tappable row: icon, label, note, chevron.
export function Row({
  href,
  onClick,
  label,
  note,
  soon,
  icon,
  tone,
}: {
  href?: string;
  onClick?: () => void;
  label: string;
  note?: React.ReactNode;
  soon?: boolean;
  icon?: LucideIcon;
  tone?: Tone;
}) {
  const inner = (
    <>
      {icon && <IconTile icon={icon} tone={tone ?? "gray"} size={34} />}
      <span className={`flex-1 text-[15px] ${soon ? "text-mute" : "font-semibold"}`}>{label}</span>
      <span className="flex items-center gap-1 text-[13px] text-mute">
        {soon ? <Soon /> : note}
        {!soon && <ChevronRight size={17} />}
      </span>
    </>
  );
  const cls = "flex w-full items-center gap-3 py-3 text-left";
  if (href && !soon)
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  return (
    <button onClick={onClick} disabled={soon && !onClick} className={cls}>
      {inner}
    </button>
  );
}

// White rounded panel that groups rows or content.
export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-3xl bg-white p-4 shadow-[0_1px_0_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(20,10,60,0.12)] ring-1 ring-rule ${className}`}>{children}</div>;
}

export function Stat({ label, value, accent, icon }: { label: string; value: React.ReactNode; accent?: boolean; icon?: LucideIcon }) {
  const Icon = icon;
  return (
    <div>
      <p className="flex items-center gap-1 text-[12px] text-mute">
        {Icon && <Icon size={13} />}
        {label}
      </p>
      <p className={`mt-0.5 text-[22px] font-extrabold tracking-tight ${accent ? "text-signal" : ""}`}>{value}</p>
    </div>
  );
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!on);
      }}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${on ? "bg-signal" : "bg-rule"}`}
    >
      <span className={`absolute top-1 size-5 rounded-full bg-white shadow transition-all ${on ? "left-6" : "left-1"}`} />
    </button>
  );
}

export function Chips<T extends string>({ value, options, onChange, label }: { value: T; options: { key: T; label: string }[]; onChange: (v: T) => void; label?: (k: T) => string }) {
  return (
    <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={`shrink-0 rounded-full px-4 py-2 text-[14px] font-semibold ${value === o.key ? "bg-ink text-white" : "bg-surface text-ink/70"}`}
        >
          {label ? label(o.key) : o.label}
        </button>
      ))}
    </div>
  );
}
