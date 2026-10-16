"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Avatar } from "@/components/CreatorPage";
import { SectionHead, Soon, Stat } from "@/components/ui";
import { displayUrl } from "@/lib/base";
import { events, proposals, useStore } from "@/lib/store";
import type { Page } from "@/lib/types";

export default function HomePage() {
  return <AppShell>{(page) => <Dashboard page={page} />}</AppShell>;
}

const DAY = 86400000;
const fmt = (n: number) => n.toLocaleString("ko-KR");

function Dashboard({ page }: { page: Page }) {
  const handle = page.profile.handle;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekStart = today.getTime() - 6 * DAY;
  const list = useStore(() => events(handle, weekStart), [handle, weekStart]);
  const inbox = useStore(() => proposals(handle), [handle]);

  const views = (since: number) => list?.filter((e) => e.kind === "view" && e.at >= since).length ?? 0;
  const clicks = (since: number) => list?.filter((e) => e.kind === "click" && e.at >= since).length ?? 0;
  const fresh = inbox?.filter((p) => p.status === "new").length ?? 0;

  const p = page.portfolio;
  const steps = [
    { done: !!page.profile.avatar && !!page.profile.bio, label: "프로필 사진과 소개 채우기", href: "/edit" },
    { done: page.blocks.length >= 3, label: "블록 3개 이상 추가하기", href: "/edit" },
    { done: views(0) > 0, label: "Instagram 프로필에 내 주소 걸기", href: "/edit" },
    { done: !!p && p.categories.length > 0 && !!p.intro, label: "협업 프로필 채우기", href: "/collab/?tab=portfolio" },
  ];
  const left = steps.filter((s) => !s.done).length;

  return (
    <main className="px-5 pb-12">
      <section className="flex items-center gap-4 pt-6">
        <Avatar name={page.profile.name} src={page.profile.avatar} size={56} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[20px] font-bold tracking-tight">{page.profile.name}</p>
          <p className="truncate text-[14px] text-mute">{displayUrl(handle)}</p>
        </div>
        <Link href="/membership" className="shrink-0 border border-rule px-2.5 py-1 text-[12px] font-semibold">
          무료 플랜
        </Link>
      </section>

      <Link href="/dm" className="mt-6 flex items-center justify-between bg-ink px-5 py-4 text-paper">
        <span>
          <span className="block text-[13px] opacity-60">Instagram 연결</span>
          <span className="block text-[16px] font-semibold">댓글에 링크가 자동으로 도착해요</span>
        </span>
        <Soon className="shrink-0" />
      </Link>

      <SectionHead title="오늘의 KNIL" more={{ href: "/stats", label: "통계 보기" }} />
      <Link href="/stats" className="grid grid-cols-3 border-y border-ink py-4">
        <Stat label="오늘 방문" value={list ? fmt(views(today.getTime())) : "–"} />
        <div className="border-l border-rule pl-3">
          <Stat label="오늘 클릭" value={list ? fmt(clicks(today.getTime())) : "–"} accent />
        </div>
        <div className="border-l border-rule pl-3">
          <Stat label="7일 방문" value={list ? fmt(views(weekStart)) : "–"} />
        </div>
      </Link>

      {left > 0 && (
        <>
          <SectionHead title={`시작하기 ${steps.length - left}/${steps.length}`} />
          <ol className="border-t border-ink">
            {steps.map((s) => (
              <li key={s.label}>
                <Link href={s.href} className="flex items-center gap-3 border-b border-rule py-3.5">
                  <span className={`grid size-5 shrink-0 place-items-center rounded-full text-[11px] ${s.done ? "bg-ink text-paper" : "border border-mute"}`}>
                    {s.done ? "✓" : ""}
                  </span>
                  <span className={s.done ? "text-mute line-through" : "font-semibold"}>{s.label}</span>
                </Link>
              </li>
            ))}
          </ol>
        </>
      )}

      <SectionHead title="크리에이터 도구" />
      <div className="grid grid-cols-2 gap-2">
        <Tool href="/edit" title="링크 관리" body="블록 추가, 순서, 숨기기" />
        <Tool href="/stats" title="통계" body="방문, 클릭, 유입 경로" />
        <Tool href="/dm" title="자동 DM" body="댓글 키워드에 링크 보내기" soon />
        <Tool href="/collab/?tab=portfolio" title="협업 프로필" body="브랜드가 보는 나의 정보" />
      </div>

      <SectionHead title="브랜드 협업" more={{ href: "/collab/?tab=inbox", label: "제안함" }} />
      <div className="grid grid-cols-2 gap-2">
        <Link href="/collab/?tab=inbox" className="border border-rule bg-white p-4">
          <p className="text-[13px] text-mute">새 제안</p>
          <p className={`mt-0.5 text-[22px] font-bold ${fresh ? "text-signal" : ""}`}>{inbox ? `${fresh}건` : "–"}</p>
        </Link>
        <div className="border border-rule bg-white p-4">
          <p className="text-[13px] text-mute">정산 가능한 리워드</p>
          <p className="mt-0.5 text-[22px] font-bold">0원</p>
        </div>
      </div>
    </main>
  );
}

function Tool({ href, title, body, soon }: { href: string; title: string; body: string; soon?: boolean }) {
  return (
    <Link href={href} className="flex min-h-24 flex-col justify-between border border-rule bg-white p-4">
      <span className="flex items-center justify-between">
        <span className="text-[16px] font-bold tracking-tight">{title}</span>
        {soon && <Soon />}
      </span>
      <span className="mt-2 text-[13px] leading-snug text-mute">{body}</span>
    </Link>
  );
}
