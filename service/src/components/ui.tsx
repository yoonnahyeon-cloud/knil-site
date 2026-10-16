import Link from "next/link";

// Small shared pieces for the signed-in screens.

export function PageTitle({ children, sub }: { children: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="pt-6 pb-4">
      <h1 className="text-[24px] font-bold tracking-[-0.04em]">{children}</h1>
      {sub && <p className="mt-1 text-[14px] text-mute">{sub}</p>}
    </div>
  );
}

export function SectionHead({ title, more }: { title: string; more?: { href: string; label?: string } }) {
  return (
    <div className="mt-9 mb-3 flex items-baseline justify-between">
      <h2 className="text-[18px] font-bold tracking-tight">{title}</h2>
      {more && (
        <Link href={more.href} className="text-[13px] text-mute">
          {more.label ?? "더보기"}
        </Link>
      )}
    </div>
  );
}

export function Soon({ className = "" }: { className?: string }) {
  return <span className={`text-[12px] font-semibold text-signal ${className}`}>준비 중</span>;
}

export function Empty({ title, body, children }: { title: string; body?: string; children?: React.ReactNode }) {
  return (
    <div className="border border-dashed border-rule px-6 py-12 text-center">
      <p className="font-semibold">{title}</p>
      {body && <p className="mt-1 text-[14px] text-mute">{body}</p>}
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}

// A tappable row with a label on the left and a note on the right.
export function Row({ href, onClick, label, note, soon }: { href?: string; onClick?: () => void; label: string; note?: React.ReactNode; soon?: boolean }) {
  const inner = (
    <>
      <span className={`text-[16px] ${soon ? "text-mute" : "font-semibold"}`}>{label}</span>
      <span className="flex items-center gap-2 text-[13px] text-mute">
        {soon ? <Soon /> : note}
        {!soon && <span aria-hidden>›</span>}
      </span>
    </>
  );
  const cls = "flex w-full items-center justify-between border-b border-rule py-4 text-left";
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

export function Stat({ label, value, accent }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div>
      <p className="text-[13px] text-mute">{label}</p>
      <p className={`mt-0.5 text-[22px] font-bold tracking-tight ${accent ? "text-signal" : ""}`}>{value}</p>
    </div>
  );
}

export function Chips<T extends string>({ value, options, onChange, label }: { value: T; options: { key: T; label: string }[]; onChange: (v: T) => void; label?: (k: T) => string }) {
  return (
    <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={`shrink-0 border px-3.5 py-1.5 text-[14px] ${value === o.key ? "border-ink bg-ink text-paper" : "border-rule text-ink"}`}
        >
          {label ? label(o.key) : o.label}
        </button>
      ))}
    </div>
  );
}
