"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Heart, Languages, Megaphone, MessageCircleMore, Search, Send, Sparkles, Stethoscope, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CreatorSheet } from "@/components/CreatorCard";
import { Avatar } from "@/components/CreatorPage";
import { PlatformMark } from "@/components/Platform";
import { IconTile, SectionHead, type Tone } from "@/components/ui";
import { campaigns, formatFollowers, getBrand, listCreators, savedCreators, sentProposals, type Creator } from "@/lib/brand";
import { threads } from "@/lib/chat";
import { useStore } from "@/lib/store";
import type { Page, Platform } from "@/lib/types";

export default function BrandHomePage() {
  return <AppShell>{(page) => <BrandHome page={page} />}</AppShell>;
}

const TOOLS: { href: string; label: string; icon: typeof Search; tone: Tone }[] = [
  { href: "/brand/creators", label: "크리에이터", icon: Search, tone: "purple" },
  { href: "/brand/proposals", label: "보낸 제안", icon: Send, tone: "ink" },
  { href: "/brand/campaigns", label: "캠페인", icon: Megaphone, tone: "pink" },
  { href: "/chat", label: "고객 채팅", icon: MessageCircleMore, tone: "sky" },
];

function BrandHome({ page }: { page: Page }) {
  const brand = getBrand();
  const creators = useStore(listCreators);
  const sent = useStore(async () => sentProposals());
  const saved = useStore(async () => savedCreators()) ?? [];
  const camps = useStore(async () => campaigns());
  const chats = useStore(() => threads(page.profile.handle), [page.profile.handle]);
  const [open, setOpen] = useState<Creator | null>(null);
  const talking = sent?.filter((s) => s.status === "talking" || s.status === "agreed").length ?? 0;
  const picks = [...(creators ?? [])].sort((a, b) => b.followers - a.followers).slice(0, 6);

  return (
    <main className="px-5 pb-12">
      <section className="mt-4 overflow-hidden rounded-[28px] bg-ink p-5 text-white lg:mt-8">
        <div className="flex items-center gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-signal">
            <Building2 size={24} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[20px] font-extrabold tracking-tight">{brand.name || "브랜드 이름을 정해 주세요"}</p>
            <p className="text-[13px] text-white/60">{brand.kind} 계정</p>
          </div>
          <Link href="/brand/profile" className="shrink-0 rounded-full bg-white/15 px-3 py-1 text-[12px] font-bold">
            프로필
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {[
            { label: "보낸 제안", value: sent?.length ?? 0, icon: Send },
            { label: "협의 · 확정", value: talking, icon: Sparkles },
            { label: "관심 크리에이터", value: saved.length, icon: Heart },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-white/10 p-3">
              <p className="flex items-center gap-1 text-[11px] text-white/60">
                <s.icon size={12} /> {s.label}
              </p>
              <p className="mt-1 text-[22px] font-extrabold leading-none">{s.value}</p>
            </div>
          ))}
        </div>
        <Link href="/brand/creators" className="mt-3 flex h-11 items-center justify-center gap-1.5 rounded-full bg-signal text-[14px] font-bold">
          <Search size={16} /> 크리에이터 찾기
        </Link>
      </section>

      <div className="mt-6 grid grid-cols-4 gap-y-4">
        {TOOLS.map((t) => (
          <Link key={t.href} href={t.href} className="flex flex-col items-center gap-1.5">
            <IconTile icon={t.icon} tone={t.tone} size={52} />
            <span className="text-[12px] font-semibold">{t.label}</span>
          </Link>
        ))}
      </div>

      <SectionHead title="추천 크리에이터" icon={Users} more={{ href: "/brand/creators", label: "전체 보기" }} />
      <div className="no-scrollbar -mx-5 flex gap-2.5 overflow-x-auto px-5 pb-1">
        {picks.map((c) => (
          <button key={c.page.profile.handle} onClick={() => setOpen(c)} className="w-40 shrink-0 rounded-[22px] bg-surface p-3 text-left">
            <Avatar name={c.page.profile.name} src={c.page.profile.avatar} size={44} />
            <p className="mt-2 truncate font-extrabold">{c.page.profile.name}</p>
            <p className="truncate text-[12px] text-mute">{c.page.portfolio?.categories.join(" · ") || "카테고리 없음"}</p>
            <p className="mt-2 flex items-center gap-1 text-[13px] font-bold">
              <Users size={13} /> {c.followers ? formatFollowers(c.followers) : "–"}
            </p>
            <div className="mt-2 flex gap-1">
              {c.channels.slice(0, 3).map((ch) => (
                <PlatformMark key={ch.platform} platform={ch.platform as Platform} size={20} />
              ))}
            </div>
          </button>
        ))}
      </div>

      <SectionHead title="해외 고객과 대화" icon={Languages} more={{ href: "/chat", label: "채팅" }} />
      <Link href="/chat" className="flex items-center gap-3 rounded-[22px] bg-soft p-4">
        <IconTile icon={Stethoscope} tone="purple" size={44} />
        <span className="min-w-0 flex-1">
          <span className="block font-bold">외국인 고객 문의를 한국어로</span>
          <span className="block text-[12px] text-ink/60">병원 예약, 제품 문의를 13개 언어로 받아요</span>
        </span>
        <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[12px] font-bold text-signal">{chats ? `${chats.reduce((s, t) => s + t.unread, 0)}건` : "–"}</span>
      </Link>

      <SectionHead title="내 캠페인" icon={Megaphone} more={{ href: "/brand/campaigns", label: "관리" }} />
      {camps && camps.length > 0 ? (
        <div className="space-y-2">
          {camps.slice(0, 3).map((c) => (
            <Link key={c.id} href="/brand/campaigns" className="flex items-center gap-3 rounded-[20px] bg-surface p-3.5">
              <IconTile icon={Megaphone} tone="pink" size={38} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold">{c.title}</span>
                <span className="text-[12px] text-mute">
                  {c.category} · {c.slots}명 · ~{c.deadline}
                </span>
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <Link href="/brand/campaigns" className="flex h-14 items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-signal/40 bg-soft/50 font-bold text-signal">
          + 첫 캠페인 만들기
        </Link>
      )}

      {open && <CreatorSheet c={open} saved={saved.includes(open.page.profile.handle)} onClose={() => setOpen(null)} />}
    </main>
  );
}
