"use client";

import { useMemo, useState } from "react";
import { ChartColumn, Eye, Link2, MousePointerClick, Percent, Route } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { IconTile } from "@/components/ui";
import { BLOCK_INFO } from "@/components/BlockForm";
import { events, useStore } from "@/lib/store";
import type { Block, Page } from "@/lib/types";

export default function StatsPage() {
  return <AppShell>{(page) => <Stats page={page} />}</AppShell>;
}

const DAY = 86400000;
const fmt = (n: number) => n.toLocaleString("ko-KR");

function Stats({ page }: { page: Page }) {
  const [range, setRange] = useState<7 | 30>(7);
  const handle = page.profile.handle;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = today.getTime() - (range - 1) * DAY;
  const list = useStore(() => events(handle, start), [handle, start]);

  const s = useMemo(() => {
    if (!list) return null;
    const views = list.filter((e) => e.kind === "view");
    const clicks = list.filter((e) => e.kind === "click");

    const days = Array.from({ length: range }, (_, i) => ({ at: start + i * DAY, views: 0, clicks: 0 }));
    for (const e of list) {
      const d = days[Math.floor((e.at - start) / DAY)];
      if (d) d[e.kind === "view" ? "views" : "clicks"]++;
    }

    const count = <T,>(xs: T[]) => {
      const m = new Map<T, number>();
      xs.forEach((x) => m.set(x, (m.get(x) ?? 0) + 1));
      return [...m].sort((a, b) => b[1] - a[1]);
    };

    return {
      views: views.length,
      clicks: clicks.length,
      days,
      targets: count(clicks.map((e) => e.target ?? "")).map(([t, n]) => ({ ...label(page.blocks, t), n })),
      sources: count(views.map((e) => e.source)),
    };
  }, [list, range, start, page.blocks]);

  if (!s) return <p className="py-20 text-center text-mute">불러오는 중…</p>;

  const max = Math.max(1, ...s.days.map((d) => d.views));
  const rate = s.views ? ((s.clicks / s.views) * 100).toFixed(1) : "0";

  return (
    <main className="px-5 pb-10">
      <div className="flex items-center justify-between pt-6">
        <h1 className="flex items-center gap-3 text-[24px] font-extrabold tracking-[-0.04em]">
          <IconTile icon={ChartColumn} tone="sky" size={40} /> 통계
        </h1>
        <div className="flex rounded-full bg-surface p-1 text-[13px] font-bold">
          {([7, 30] as const).map((r) => (
            <button key={r} onClick={() => setRange(r)} className={`rounded-full px-3.5 py-1.5 ${range === r ? "bg-ink text-white" : "text-mute"}`}>
              {r}일
            </button>
          ))}
        </div>
      </div>
      {handle === "rosie" && <p className="mt-1 text-[12px] text-mute">예시 계정의 수치는 설명용 예시 데이터예요.</p>}

      <dl className="mt-5 grid grid-cols-3 gap-2">
        {[
          { k: "방문", v: fmt(s.views), icon: Eye, cls: "bg-surface" },
          { k: "클릭", v: fmt(s.clicks), icon: MousePointerClick, cls: "bg-signal text-white" },
          { k: "클릭률", v: `${rate}%`, icon: Percent, cls: "bg-surface" },
        ].map((x) => (
          <div key={x.k} className={`rounded-[20px] p-3.5 ${x.cls}`}>
            <dt className="flex items-center gap-1 text-[12px] opacity-70">
              <x.icon size={13} /> {x.k}
            </dt>
            <dd className="mt-1 text-[22px] font-extrabold tracking-tight">{x.v}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-3 rounded-[24px] bg-surface p-4">
        <div className="flex h-36 items-end gap-[3px]">
          {s.days.map((d) => (
            <div key={d.at} className="relative flex-1" style={{ height: `${(d.views / max) * 100}%` }}>
              <div className="absolute inset-0 rounded-t-md bg-tone-1" />
              <div className="absolute inset-x-0 bottom-0 rounded-t-md bg-signal" style={{ height: d.views ? `${(d.clicks / d.views) * 100}%` : 0 }} />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[12px] text-mute">
          <span>{new Date(s.days[0].at).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })}</span>
          <span className="flex gap-3">
            <span><i className="mr-1 inline-block size-2 rounded-full bg-tone-1" />방문</span>
            <span><i className="mr-1 inline-block size-2 rounded-full bg-signal" />클릭</span>
          </span>
          <span>오늘</span>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-2 flex items-center gap-1.5 text-[18px] font-extrabold tracking-tight">
          <Link2 size={19} className="text-signal" /> 많이 누른 링크
        </h2>
        {s.targets.length === 0 && <Empty />}
        {s.targets.slice(0, 10).map((t, i) => (
          <div key={t.key} className="flex items-center gap-3 border-b border-rule py-3">
            <span className={`grid size-7 shrink-0 place-items-center rounded-full text-[12px] font-extrabold ${i < 3 ? "bg-signal text-white" : "bg-surface text-mute"}`}>{i + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold">{t.name}</p>
              <p className="text-[12px] text-mute">{t.kind}</p>
            </div>
            <span className="shrink-0 text-[15px] font-extrabold">{fmt(t.n)}</span>
          </div>
        ))}
      </section>

      <section className="mt-8">
        <h2 className="mb-2 flex items-center gap-1.5 text-[18px] font-extrabold tracking-tight">
          <Route size={19} className="text-signal" /> 어디서 들어왔나요
        </h2>
        {s.sources.length === 0 && <Empty />}
        {s.sources.map(([src, n]) => (
          <div key={src} className="border-b border-rule py-3">
            <div className="flex justify-between text-[15px]">
              <span className="font-semibold">{src}</span>
              <span>
                {fmt(n)} <span className="text-mute">· {Math.round((n / s.views) * 100)}%</span>
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface">
              <div className="h-full rounded-full bg-signal" style={{ width: `${(n / s.views) * 100}%` }} />
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

function Empty() {
  return <p className="py-8 text-center text-[14px] text-mute">아직 기록이 없어요. 내 페이지 주소를 프로필에 걸어 보세요.</p>;
}

function label(blocks: Block[], target: string) {
  const [bid, iid] = target.split(":");
  const b = blocks.find((x) => x.id === bid);
  if (!b) return { key: target, name: "삭제된 블록", kind: "" };
  const kind = BLOCK_INFO[b.type].name;
  if (b.type === "channels") return { key: target, name: b.items.find((c) => c.id === iid)?.platform ?? "채널", kind };
  if (b.type === "gallery") return { key: target, name: b.items.find((g) => g.id === iid)?.label || "사진", kind: `${kind} · ${b.title}` };
  if (b.type === "products") return { key: target, name: b.items.find((p) => p.id === iid)?.name || "상품", kind: `${kind} · ${b.title}` };
  return { key: target, name: b.title, kind };
}
