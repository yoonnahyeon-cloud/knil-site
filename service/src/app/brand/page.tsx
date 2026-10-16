"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  ExternalLink,
  Handshake,
  Languages,
  Link2,
  Megaphone,
  MessageCircleMore,
  Pencil,
  Plus,
  Search,
  Send,
  Users,
  type LucideIcon,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { BrandIntro } from "@/components/BrandIntro";
import { BrandSwitcher } from "@/components/BrandSwitcher";
import { CreatorSheet } from "@/components/CreatorCard";
import { Avatar } from "@/components/CreatorPage";
import { PlatformMark } from "@/components/Platform";
import { IconTile, SectionHead, type Tone } from "@/components/ui";
import { SENT_STATUS, campaigns, formatFollowers, getBrand, isClinic, listCreators, savedCreators, sentProposals, type Creator } from "@/lib/brand";
import { BASE } from "@/lib/base";
import { langOf } from "@/lib/i18n";
import { threads } from "@/lib/chat";
import { useStore } from "@/lib/store";
import type { Page, Platform } from "@/lib/types";

export default function BrandHomePage() {
  return <AppShell>{(page) => <BrandHome page={page} />}</AppShell>;
}

type Tool = { href: string; label: string; icon: LucideIcon; tone: Tone };

// A clinic's day is patient consultations; a brand's is creator campaigns.
const CLINIC_TOOLS: Tool[] = [
  { href: "/brand/link", label: "병원 페이지", icon: Link2, tone: "ink" },
  { href: "/chat", label: "AI 해외 상담", icon: MessageCircleMore, tone: "sky" },
  { href: "/brand/creators", label: "크리에이터", icon: Search, tone: "purple" },
  { href: "/brand/campaigns", label: "캠페인", icon: Megaphone, tone: "mint" },
];
const BRAND_TOOLS: Tool[] = [
  { href: "/brand/campaigns", label: "캠페인", icon: Megaphone, tone: "ink" },
  { href: "/brand/creators", label: "크리에이터", icon: Search, tone: "purple" },
  { href: "/brand/proposals", label: "협업 관리", icon: Handshake, tone: "sky" },
  { href: "/brand/link", label: "브랜드 페이지", icon: Link2, tone: "mint" },
];

const DAY = 86400000;
const dday = (date: string) => {
  const n = Math.ceil((Date.parse(date) - Date.now()) / DAY);
  return n < 0 ? "마감" : n === 0 ? "D-day" : `D-${n}`;
};

function BrandHome({ page }: { page: Page }) {
  const brand = getBrand();
  const clinic = isClinic(brand);
  const creators = useStore(listCreators);
  const sent = useStore(async () => sentProposals(), [page.profile.handle]);
  const saved = useStore(async () => savedCreators(), [page.profile.handle]) ?? [];
  const camps = useStore(async () => campaigns(), [page.profile.handle]);
  const chats = useStore(() => threads(page.profile.handle), [page.profile.handle]);
  const [open, setOpen] = useState<Creator | null>(null);
  const [intro, setIntro] = useState(false);

  const unread = chats?.reduce((n, t) => n + t.unread, 0) ?? 0;
  const talking = sent?.filter((s) => s.status === "talking").length ?? 0;
  const live = camps?.filter((c) => !c.deadline || Date.parse(c.deadline) >= Date.now() - DAY) ?? [];
  // Creators in the brand's own field first (beauty for a cosmetics brand or a skin clinic).
  const field = clinic || /뷰티|코스메|스킨/.test(brand.intro + brand.name) ? "뷰티" : "";
  const picks = [...(creators ?? [])]
    .sort((a, b) => Number(b.page.portfolio?.categories.includes(field) ?? 0) - Number(a.page.portfolio?.categories.includes(field) ?? 0) || b.followers - a.followers)
    .slice(0, 6);

  const stats = clinic
    ? [
        { label: "새 상담", value: unread },
        { label: "전체 상담", value: chats?.length ?? 0 },
        { label: "보낸 제안", value: sent?.length ?? 0 },
      ]
    : [
        { label: "진행 중 캠페인", value: live.length },
        { label: "협의 중", value: talking },
        { label: "새 고객 문의", value: unread },
      ];

  return (
    <main className="px-5 pb-12">
      <section className="mt-4 rounded-[28px] bg-white p-4 ring-1 ring-rule lg:mt-8">
        <BrandSwitcher compact />
        <div className="mt-4 grid grid-cols-3 gap-2">
          {stats.map((x) => (
            <div key={x.label} className="rounded-2xl bg-surface p-3">
              <p className="text-[11px] text-mute">{x.label}</p>
              <p className="mt-1 text-[22px] font-extrabold leading-none">{x.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {clinic ? (
            <>
              <Link href="/brand/link" className="btn h-11 gap-1.5 text-[14px]">
                <Pencil size={15} /> 페이지 꾸미기
              </Link>
              <a href={`${BASE}/@${page.profile.handle}`} target="_blank" rel="noopener" className="btn-ghost h-11 gap-1.5 text-[14px]">
                <ExternalLink size={15} /> 페이지 보기
              </a>
            </>
          ) : (
            <>
              <Link href="/brand/campaigns?new=1" className="btn h-11 gap-1.5 whitespace-nowrap px-3 text-[14px]">
                <Plus size={16} /> 캠페인 만들기
              </Link>
              <Link href="/brand/creators" className="btn-ghost h-11 gap-1.5 whitespace-nowrap px-3 text-[14px]">
                <Search size={15} /> 크리에이터 찾기
              </Link>
            </>
          )}
        </div>
      </section>

      <div className="mt-6 grid grid-cols-4 gap-y-4">
        {(clinic ? CLINIC_TOOLS : BRAND_TOOLS).map((t) => (
          <Link key={t.href} href={t.href} className="flex flex-col items-center gap-1.5">
            <IconTile icon={t.icon} tone={t.tone} size={52} />
            <span className="text-[12px] font-semibold">{t.label}</span>
          </Link>
        ))}
      </div>

      {clinic ? (
        <>
          <SectionHead title="AI 해외 고객 상담" icon={Languages} more={{ href: "/chat", label: "전체" }} />
          <div className="divide-y divide-rule rounded-[22px] bg-white ring-1 ring-rule">
            {(chats ?? []).slice(0, 3).map((t) => (
              <Link key={t.id} href={`/chat/?c=${t.id}`} className="flex items-center gap-3 p-3.5">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface text-[20px]">{langOf(t.lang).flag}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-bold">
                    {t.name} <span className="font-normal text-mute">· {langOf(t.lang).ko}</span>
                  </span>
                  <span className="block truncate text-[13px] text-mute">{t.last}</span>
                </span>
                {t.unread > 0 && <span className="grid size-5 place-items-center rounded-full bg-ink text-[11px] font-bold text-white">{t.unread}</span>}
              </Link>
            ))}
            {chats?.length === 0 && <p className="p-5 text-center text-[13px] text-mute">아직 상담이 없어요.</p>}
          </div>
          <Link href="/brand/link" className="mt-2 flex items-center gap-3 rounded-[22px] bg-mist p-4">
            <IconTile icon={CalendarCheck} tone="soft" size={40} />
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-bold">상담 예약 블록</span>
              <span className="block text-[12px] text-ink/60">외국어 예약 요청이 이 상담함으로 들어와요</span>
            </span>
          </Link>
        </>
      ) : (
        <>
          <SectionHead title="협업 현황" icon={Handshake} more={{ href: "/brand/proposals", label: "협업 관리" }} />
          <div className="grid grid-cols-4 gap-1.5">
            {SENT_STATUS.map((st) => (
              <Link key={st.key} href="/brand/proposals" className="rounded-2xl bg-surface px-2 py-3 text-center">
                <p className="text-[20px] font-extrabold leading-none">{sent?.filter((s) => s.status === st.key).length ?? 0}</p>
                <p className="mt-1 text-[11px] text-mute">{st.label}</p>
              </Link>
            ))}
          </div>
          <div className="mt-2 divide-y divide-rule rounded-[22px] bg-white ring-1 ring-rule">
            {(sent ?? []).slice(0, 3).map((s) => {
              const c = creators?.find((x) => x.page.profile.handle === s.handle);
              return (
                <Link key={s.id} href="/brand/proposals" className="flex items-center gap-3 p-3.5">
                  <Avatar name={s.name} src={c?.page.profile.avatar} size={38} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-bold">{s.name}</span>
                    <span className="block truncate text-[12px] text-mute">{s.message}</span>
                  </span>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${s.status === "agreed" ? "bg-ink text-white" : "bg-surface"}`}>
                    {SENT_STATUS.find((x) => x.key === s.status)?.label}
                  </span>
                </Link>
              );
            })}
            {sent?.length === 0 && <p className="p-5 text-center text-[13px] text-mute">크리에이터에게 첫 제안을 보내 보세요.</p>}
          </div>

          <SectionHead title="진행 중 캠페인" icon={Megaphone} more={{ href: "/brand/campaigns", label: "관리" }} />
          {live.length > 0 ? (
            <div className="no-scrollbar -mx-5 flex gap-2.5 overflow-x-auto px-5">
              {live.map((c, i) => (
                <Link key={c.id} href="/brand/campaigns" className={`w-64 shrink-0 rounded-[22px] p-4 ${["bg-lilac", "bg-mist", "bg-sage"][i % 3]}`}>
                  <span className="rounded-lg bg-white px-2 py-0.5 text-[11px] font-bold">{c.deadline ? dday(c.deadline) : "상시"}</span>
                  <p className="mt-3 line-clamp-2 min-h-[44px] text-[15px] font-extrabold leading-snug">{c.title}</p>
                  <p className="mt-2 text-[12px] text-ink/60">
                    {c.reward} · {c.slots}명
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <Link href="/brand/campaigns?new=1" className="flex h-14 items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-rule font-bold text-mute">
              + 첫 캠페인 만들기
            </Link>
          )}
        </>
      )}

      <SectionHead title={field ? "우리와 맞는 뷰티 크리에이터" : "추천 크리에이터"} icon={Users} more={{ href: "/brand/creators", label: "전체 보기" }} />
      <div className="no-scrollbar -mx-5 flex gap-2.5 overflow-x-auto px-5 pb-1">
        {picks.map((c) => (
          <button key={c.page.profile.handle} onClick={() => setOpen(c)} className="w-40 shrink-0 rounded-[22px] bg-white p-3 text-left ring-1 ring-rule">
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

      {!clinic && (
        <>
          <SectionHead title="AI 해외 고객 상담" icon={Languages} more={{ href: "/chat", label: "채팅" }} />
          <Link href="/chat" className="flex items-center gap-3 rounded-[22px] bg-surface p-4">
            <IconTile icon={MessageCircleMore} tone="sky" size={44} />
            <span className="min-w-0 flex-1">
              <span className="block font-bold">해외 배송, 성분 문의를 한국어로</span>
              <span className="block text-[12px] text-ink/60">13개 언어로 받고, AI가 먼저 답해요</span>
            </span>
            <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[12px] font-bold">{unread}건</span>
          </Link>
          <Link href="/brand/link" className="mt-2 flex items-center gap-3 rounded-[22px] bg-surface p-4">
            <Avatar name={page.profile.name} src={page.profile.avatar} size={44} />
            <span className="min-w-0 flex-1">
              <span className="block font-bold">브랜드 페이지</span>
              <span className="block truncate text-[12px] text-ink/60">knil.kr/@{page.profile.handle} · 제품, 세일 일정, 리뷰</span>
            </span>
            <Send size={17} className="shrink-0 text-mute" />
          </Link>
        </>
      )}

      <button onClick={() => setIntro(true)} className="mt-10 flex w-full items-center justify-center gap-1.5 text-[13px] text-mute">
        KNIL 브랜드 계정 소개 다시 보기
      </button>

      <BrandIntro open={intro} onClose={() => setIntro(false)} />
      {open && <CreatorSheet c={open} saved={saved.includes(open.page.profile.handle)} onClose={() => setOpen(null)} />}
    </main>
  );
}
