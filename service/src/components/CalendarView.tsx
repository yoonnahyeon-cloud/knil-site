"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { Block, CalendarEvent } from "@/lib/types";

type Cal = Extract<Block, { type: "calendar" }>;

export const KIND_COLOR: Record<string, string> = {
  공구: "#111111",
  기획전: "#8f8bb0",
  라이브: "#7f90a8",
  이벤트: "#8a9e85",
  휴무: "#bdbdbd",
};

const DAY = 86400000;
const parse = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1).getTime();
};
const startOf = (e: CalendarEvent) => parse(e.start);
const endOf = (e: CalendarEvent) => parse(e.end || e.start);

// A month calendar drawn from the schedule entries, plus the list of this
// month's entries with a D-day. `t` translates words (kinds) for visitors.
export function CalendarView({
  block: b,
  lang,
  t,
  onOpen,
}: {
  block: Cal;
  lang: string;
  t: (s: string) => string;
  onOpen: (e: CalendarEvent) => (ev: React.MouseEvent) => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const events = useMemo(() => b.items.filter((e) => e.start && e.title).sort((x, y) => startOf(x) - startOf(y)), [b.items]);
  // Open on this month, or on the next month that has something on it.
  const [month, setMonth] = useState(() => {
    const now = new Date(today.getFullYear(), today.getMonth(), 1);
    const has = (m: Date) => events.some((e) => endOf(e) >= m.getTime() && startOf(e) < new Date(m.getFullYear(), m.getMonth() + 1, 1).getTime());
    if (has(now)) return now;
    const next = events.find((e) => startOf(e) >= now.getTime());
    return next ? new Date(new Date(startOf(next)).getFullYear(), new Date(startOf(next)).getMonth(), 1) : now;
  });

  const locale = lang === "ko" ? "ko-KR" : lang;
  const first = month.getTime();
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0).getTime();
  const lead = month.getDay();
  const days = Math.round((last - first) / DAY) + 1;
  const cells = Array.from({ length: Math.ceil((lead + days) / 7) * 7 }, (_, i) => (i < lead || i >= lead + days ? null : first + (i - lead) * DAY));
  const weekdays = Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(locale, { weekday: "narrow" }).format(new Date(2026, 1, 1 + i)));
  const on = (day: number) => events.filter((e) => startOf(e) <= day && endOf(e) >= day);
  const inMonth = events.filter((e) => endOf(e) >= first && startOf(e) <= last);
  const shift = (d: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + d, 1));
  const fmt = (ms: number) => new Intl.DateTimeFormat(locale, { month: "numeric", day: "numeric" }).format(ms);

  const badge = (e: CalendarEvent) => {
    const s = startOf(e);
    const en = endOf(e);
    if (en < today.getTime()) return { text: "END", live: false };
    if (s <= today.getTime()) return { text: "LIVE", live: true };
    return { text: `D-${Math.round((s - today.getTime()) / DAY)}`, live: false };
  };

  return (
    <section className="pt-3">
      <div className="overflow-hidden rounded-[24px] bg-white ring-1 ring-rule">
        <div className="flex items-center justify-between bg-ink px-4 py-3 text-white">
          <div className="min-w-0">
            <p className="truncate text-[16px] font-extrabold">{b.title}</p>
            {b.note && <p className="truncate text-[11px] text-white/60">{b.note}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button onClick={() => shift(-1)} aria-label="prev" className="grid size-7 place-items-center rounded-full bg-white/10">
              <ChevronLeft size={16} />
            </button>
            <span className="min-w-16 text-center text-[13px] font-bold">{new Intl.DateTimeFormat(locale, { year: "numeric", month: "short" }).format(month)}</span>
            <button onClick={() => shift(1)} aria-label="next" className="grid size-7 place-items-center rounded-full bg-white/10">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 px-2 pt-2 text-center text-[10px] font-bold text-mute">
          {weekdays.map((w, i) => (
            <span key={i} className={i === 0 ? "text-[#8a8a8a]" : i === 6 ? "text-[#7f90a8]" : ""}>
              {w}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px px-2 pt-1 pb-2">
          {cells.map((day, i) => {
            if (day === null) return <span key={i} />;
            const list = on(day);
            const isToday = day === today.getTime();
            return (
              <div key={i} className="min-h-[52px] rounded-lg px-0.5 pt-1">
                <span className={`mx-auto grid size-5 place-items-center rounded-full text-[11px] font-bold ${isToday ? "bg-signal text-white" : i % 7 === 0 ? "text-[#8a8a8a]" : ""}`}>
                  {new Date(day).getDate()}
                </span>
                <div className="mt-0.5 space-y-px">
                  {list.slice(0, 2).map((e) => (
                    <span key={e.id} className="block truncate rounded-[3px] px-0.5 text-[8.5px] font-bold leading-[13px] text-white" style={{ background: KIND_COLOR[e.kind] ?? "#111111" }}>
                      {startOf(e) === day || new Date(day).getDay() === 0 ? e.title : " "}
                    </span>
                  ))}
                  {list.length > 2 && <span className="block text-center text-[8px] font-bold text-mute">+{list.length - 2}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {inMonth.length > 0 && (
        <div className="mt-2 space-y-1.5">
          {inMonth.map((e) => {
            const d = badge(e);
            return (
              <a
                key={e.id}
                href={e.url || "#"}
                target="_blank"
                rel="noopener"
                onClick={onOpen(e)}
                className={`flex items-center gap-3 rounded-2xl bg-surface p-3 ${d.text === "END" ? "opacity-50" : ""}`}
              >
                <span className="h-9 w-1 shrink-0 rounded-full" style={{ background: KIND_COLOR[e.kind] ?? "#111111" }} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="shrink-0 text-[11px] font-extrabold" style={{ color: KIND_COLOR[e.kind] }}>
                      {t(e.kind)}
                    </span>
                    <span className="truncate text-[14px] font-bold">{e.title}</span>
                  </span>
                  <span className="text-[12px] text-mute">
                    {fmt(startOf(e))}
                    {e.end && e.end !== e.start ? ` – ${fmt(endOf(e))}` : ""}
                  </span>
                </span>
                <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-extrabold ${d.live ? "bg-signal text-white" : "bg-white"}`}>{d.text}</span>
                {e.url && <ArrowUpRight size={16} className="shrink-0 text-mute" />}
              </a>
            );
          })}
        </div>
      )}
    </section>
  );
}
