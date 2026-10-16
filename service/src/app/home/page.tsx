"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChartColumn,
  Check,
  Copy,
  Crown,
  ExternalLink,
  Eye,
  Gift,
  Handshake,
  IdCard,
  Inbox,
  Link2,
  MessageCircleMore,
  MousePointerClick,
  Rocket,
  Send,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Avatar } from "@/components/CreatorPage";
import { IconTile, SectionHead, Soon, type Tone } from "@/components/ui";
import { BASE, displayUrl, publicUrl } from "@/lib/base";
import { threads } from "@/lib/chat";
import { LANGS } from "@/lib/i18n";
import { events, proposals, useStore } from "@/lib/store";
import type { Page } from "@/lib/types";

export default function HomePage() {
  return <AppShell>{(page) => <Dashboard page={page} />}</AppShell>;
}

const DAY = 86400000;
const fmt = (n: number) => n.toLocaleString("ko-KR");

const TOOLS: { href: string; label: string; icon: LucideIcon; tone: Tone; soon?: boolean }[] = [
  { href: "/edit", label: "링크 편집", icon: Link2, tone: "purple" },
  { href: "/stats", label: "통계", icon: ChartColumn, tone: "sky" },
  { href: "/chat", label: "해외 채팅", icon: MessageCircleMore, tone: "ink" },
  { href: "/dm", label: "자동 DM", icon: Send, tone: "pink", soon: true },
  { href: "/collab/?tab=inbox", label: "협업 제안", icon: Inbox, tone: "mint" },
  { href: "/collab/?tab=portfolio", label: "협업 프로필", icon: IdCard, tone: "amber" },
  { href: "/invite", label: "친구 초대", icon: Gift, tone: "soft" },
  { href: "/membership", label: "멤버십", icon: Crown, tone: "gray" },
];

function Dashboard({ page }: { page: Page }) {
  const handle = page.profile.handle;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekStart = today.getTime() - 6 * DAY;
  const list = useStore(() => events(handle, weekStart), [handle, weekStart]);
  const inbox = useStore(() => proposals(handle), [handle]);
  const chats = useStore(() => threads(handle), [handle]);
  const [copied, setCopied] = useState(false);

  const views = (since: number) => list?.filter((e) => e.kind === "view" && e.at >= since).length ?? 0;
  const clicks = (since: number) => list?.filter((e) => e.kind === "click" && e.at >= since).length ?? 0;
  const fresh = inbox?.filter((p) => p.status === "new").length ?? 0;
  const unread = chats?.reduce((s, t) => s + t.unread, 0) ?? 0;

  const p = page.portfolio;
  const steps = [
    { done: !!page.profile.avatar && !!page.profile.bio, label: "프로필 사진과 소개 채우기", href: "/edit" },
    { done: page.blocks.length >= 3, label: "블록 3개 이상 추가하기", href: "/edit" },
    { done: views(0) > 0, label: "Instagram 프로필에 내 주소 걸기", href: "/edit" },
    { done: !!page.chat?.on, label: "해외 팬 채팅 켜기", href: "/chat" },
    { done: !!p && p.categories.length > 0 && !!p.intro, label: "협업 프로필 채우기", href: "/collab/?tab=portfolio" },
  ];
  const done = steps.filter((s) => s.done).length;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl(handle));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <main className="px-5 pb-12">
      <section className="mt-4 overflow-hidden rounded-[28px] bg-[radial-gradient(130%_120%_at_100%_0%,#9b7bff_0%,#7c4dff_30%,#241a3d_70%,#0b0b0f_100%)] p-5 text-white lg:mt-8">
        <div className="flex items-center gap-3">
          <div className="rounded-full ring-2 ring-white/40">
            <Avatar name={page.profile.name} src={page.profile.avatar} size={52} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[20px] font-extrabold tracking-tight">{page.profile.name}</p>
            <p className="truncate text-[13px] text-white/60">{displayUrl(handle)}</p>
          </div>
          <Link href="/membership" className="shrink-0 rounded-full bg-white/15 px-3 py-1 text-[12px] font-bold backdrop-blur">
            FREE
          </Link>
        </div>
        <Link href="/stats" className="mt-5 grid grid-cols-3 gap-2">
          {[
            { label: "오늘 방문", value: views(today.getTime()), icon: Eye },
            { label: "오늘 클릭", value: clicks(today.getTime()), icon: MousePointerClick },
            { label: "7일 방문", value: views(weekStart), icon: ChartColumn },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-white/10 p-3 backdrop-blur">
              <p className="flex items-center gap-1 text-[11px] text-white/60">
                <s.icon size={12} /> {s.label}
              </p>
              <p className="mt-1 text-[22px] font-extrabold leading-none">{list ? fmt(s.value) : "–"}</p>
            </div>
          ))}
        </Link>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <a href={`${BASE}/@${handle}`} target="_blank" rel="noopener" className="flex h-11 items-center justify-center gap-1.5 rounded-full bg-white text-[14px] font-bold text-ink">
            <ExternalLink size={16} /> 내 페이지
          </a>
          <button onClick={copy} className="flex h-11 items-center justify-center gap-1.5 rounded-full bg-white/15 text-[14px] font-bold backdrop-blur">
            {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "복사했어요" : "주소 복사"}
          </button>
        </div>
      </section>

      <div className="mt-6 grid grid-cols-4 gap-y-4">
        {TOOLS.map((t) => (
          <Link key={t.href} href={t.href} className="relative flex flex-col items-center gap-1.5">
            <IconTile icon={t.icon} tone={t.tone} size={52} />
            <span className="text-[12px] font-semibold">{t.label}</span>
            {t.href === "/chat" && unread > 0 && <Badge n={unread} />}
            {t.href.includes("inbox") && fresh > 0 && <Badge n={fresh} />}
          </Link>
        ))}
      </div>

      <Link href="/chat" className="mt-7 block overflow-hidden rounded-[24px] bg-ink p-5 text-white">
        <span className="inline-block rounded-full bg-signal px-2.5 py-1 text-[11px] font-bold">NEW</span>
        <p className="mt-3 text-[20px] font-extrabold leading-tight tracking-tight">
          주소는 하나,
          <br />
          <span className="text-[#b9a6ff]">언어마다 다른 프로필</span>
        </p>
        <p className="mt-1.5 text-[13px] text-white/60">해외 팬이 자기 언어로 보고, 묻고, 답을 받아요.</p>
        <div className="mt-4 flex -space-x-1.5">
          {LANGS.slice(0, 9).map((l) => (
            <span key={l.code} className="grid size-8 place-items-center rounded-full bg-white/10 text-[16px] ring-2 ring-ink">
              {l.flag}
            </span>
          ))}
          <span className="grid size-8 place-items-center rounded-full bg-white/10 text-[11px] font-bold ring-2 ring-ink">+{LANGS.length - 9}</span>
        </div>
      </Link>

      {done < steps.length && (
        <>
          <SectionHead title="시작하기" icon={Rocket} />
          <div className="rounded-[24px] bg-surface p-4">
            <div className="flex items-center justify-between text-[13px] font-bold">
              <span>
                {done}/{steps.length} 완료
              </span>
              <span className="text-signal">{Math.round((done / steps.length) * 100)}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full bg-signal transition-all" style={{ width: `${(done / steps.length) * 100}%` }} />
            </div>
            <ol className="mt-3 space-y-1">
              {steps.map((s) => (
                <li key={s.label}>
                  <Link href={s.href} className="flex items-center gap-3 rounded-xl px-1 py-2">
                    <span className={`grid size-6 shrink-0 place-items-center rounded-full ${s.done ? "bg-signal text-white" : "border-2 border-rule bg-white"}`}>
                      {s.done && <Check size={14} strokeWidth={3} />}
                    </span>
                    <span className={`text-[14px] ${s.done ? "text-mute line-through" : "font-semibold"}`}>{s.label}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </>
      )}

      <SectionHead title="브랜드 협업" icon={Handshake} more={{ href: "/collab/?tab=inbox", label: "제안함" }} />
      <div className="grid grid-cols-2 gap-2">
        <Link href="/collab/?tab=inbox" className="rounded-[22px] bg-soft p-4">
          <Inbox size={20} className="text-signal" />
          <p className="mt-3 text-[13px] text-ink/60">새 제안</p>
          <p className="text-[24px] font-extrabold leading-tight text-signal">{inbox ? `${fresh}건` : "–"}</p>
        </Link>
        <div className="rounded-[22px] bg-surface p-4">
          <Wallet size={20} />
          <p className="mt-3 text-[13px] text-ink/60">정산 가능 리워드</p>
          <p className="text-[24px] font-extrabold leading-tight">0원</p>
        </div>
      </div>

      <Link href="/dm" className="mt-3 flex items-center gap-3 rounded-[22px] bg-[linear-gradient(120deg,#ff5fa2,#7c4dff)] p-4 text-white">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/20">
          <Send size={20} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-bold">댓글에 링크가 자동으로 도착</span>
          <span className="block text-[12px] text-white/75">Instagram 자동 DM</span>
        </span>
        <Soon className="!bg-white/20 !text-white" />
      </Link>
    </main>
  );
}

function Badge({ n }: { n: number }) {
  return <span className="absolute -top-1 right-[calc(50%-34px)] grid min-w-5 place-items-center rounded-full bg-signal px-1 text-[11px] font-bold text-white ring-2 ring-white">{n}</span>;
}
