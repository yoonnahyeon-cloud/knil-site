"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  Check,
  ChartColumn,
  Megaphone,
  Search,
  Copy,
  Crown,
  ExternalLink,
  Gift,
  Handshake,
  House,
  Link2,
  Menu,
  MessageCircleMore,
  Send,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { Avatar } from "@/components/CreatorPage";
import { activeBrand, getBrand, isClinic, setMode, useMode, type Mode } from "@/lib/brand";
import { BrandSwitcher } from "@/components/BrandSwitcher";
import { BASE, displayUrl, publicUrl } from "@/lib/base";
import { getMyPage, getPage, useStore } from "@/lib/store";
import type { Page } from "@/lib/types";

type Nav = { href: string; label: string; icon: LucideIcon; also?: string[] };

// Bottom tabs on a phone. `also` lists the other screens that light up the
// same tab.
const TABS: Nav[] = [
  { href: "/home", label: "홈", icon: House },
  { href: "/edit", label: "링크", icon: Link2, also: ["/stats"] },
  { href: "/chat", label: "채팅", icon: MessageCircleMore },
  { href: "/collab", label: "협업", icon: Handshake },
  { href: "/menu", label: "전체", icon: Menu, also: ["/settings", "/invite", "/membership", "/dm"] },
];

// A clinic lives on patient consultations; a brand on creator campaigns.
const CLINIC_TABS: Nav[] = [
  { href: "/brand", label: "홈", icon: House },
  { href: "/brand/link", label: "페이지", icon: Link2 },
  { href: "/chat", label: "상담", icon: MessageCircleMore },
  { href: "/brand/creators", label: "크리에이터", icon: Search, also: ["/brand/proposals", "/brand/campaigns"] },
  { href: "/menu", label: "전체", icon: Menu, also: ["/settings", "/brand/profile"] },
];
const BRAND_TABS: Nav[] = [
  { href: "/brand", label: "홈", icon: House },
  { href: "/brand/campaigns", label: "캠페인", icon: Megaphone },
  { href: "/brand/creators", label: "크리에이터", icon: Search, also: ["/brand/proposals"] },
  { href: "/chat", label: "채팅", icon: MessageCircleMore },
  { href: "/menu", label: "전체", icon: Menu, also: ["/settings", "/brand/profile", "/brand/link"] },
];

const CLINIC_SIDE: Nav[] = [
  { href: "/brand", label: "홈", icon: House },
  { href: "/brand/link", label: "병원 페이지", icon: Link2 },
  { href: "/chat", label: "AI 해외 고객 상담", icon: MessageCircleMore },
  { href: "/brand/creators", label: "크리에이터 찾기", icon: Search },
  { href: "/brand/proposals", label: "보낸 제안", icon: Send },
  { href: "/brand/campaigns", label: "캠페인", icon: Megaphone },
  { href: "/brand/profile", label: "계정 정보", icon: Building2 },
  { href: "/settings", label: "설정", icon: Settings },
];
const BRAND_SIDE: Nav[] = [
  { href: "/brand", label: "홈", icon: House },
  { href: "/brand/campaigns", label: "캠페인", icon: Megaphone },
  { href: "/brand/creators", label: "크리에이터 찾기", icon: Search },
  { href: "/brand/proposals", label: "협업 관리", icon: Send },
  { href: "/brand/link", label: "브랜드 페이지", icon: Link2 },
  { href: "/chat", label: "AI 해외 고객 상담", icon: MessageCircleMore },
  { href: "/brand/profile", label: "계정 정보", icon: Building2 },
  { href: "/settings", label: "설정", icon: Settings },
];

const HOME: Record<Mode, string> = { creator: "/home", brand: "/brand" };
const CREATOR_ONLY = ["/home", "/edit", "/stats", "/dm", "/collab", "/invite", "/membership"];

// Sidebar on a computer, where there is room for every screen.
const SIDE: Nav[] = [
  { href: "/home", label: "홈", icon: House },
  { href: "/edit", label: "프로필 링크", icon: Link2 },
  { href: "/stats", label: "통계", icon: ChartColumn },
  { href: "/chat", label: "AI 해외 팬 채팅", icon: MessageCircleMore },
  { href: "/dm", label: "자동 DM", icon: Send },
  { href: "/collab", label: "브랜드 협업", icon: Handshake },
  { href: "/invite", label: "친구 초대", icon: Gift },
  { href: "/membership", label: "멤버십", icon: Crown },
  { href: "/settings", label: "설정", icon: Settings },
];

// Signed-in frame: address bar on top and tabs at the bottom on a phone
// (thumb reach), a sidebar on a computer.
export function AppShell({ children, wide }: { children: (page: Page) => React.ReactNode; wide?: boolean }) {
  const router = useRouter();
  const path = usePathname().replace(/\/$/, "");
  const mine = useStore(getMyPage);
  const brandPage = useStore(() => getPage(activeBrand()));
  const stored = useMode();
  const [copied, setCopied] = useState(false);
  // Screens that belong to one side switch the view to that side.
  const mode: Mode = path.includes("/brand") ? "brand" : CREATOR_ONLY.some((r) => path.endsWith(r)) ? "creator" : stored;

  useEffect(() => {
    if (mine === null) router.replace("/");
  }, [mine, router]);
  useEffect(() => {
    if (mode !== stored) setMode(mode);
  }, [mode, stored]);

  // In the brand view every screen works on the brand's own page.
  const page = mode === "brand" ? brandPage : mine;
  if (!mine || !page) return null;
  const handle = page.profile.handle;
  const on = (n: Nav) => path.endsWith(n.href) || !!n.also?.some((a) => path.endsWith(a));
  const brand = getBrand();
  const clinic = isClinic(brand);
  const tabs = mode === "brand" ? (clinic ? CLINIC_TABS : BRAND_TABS) : TABS;
  const side = mode === "brand" ? (clinic ? CLINIC_SIDE : BRAND_SIDE) : SIDE;
  const switchTo = (m: Mode) => {
    if (m === mode) return;
    setMode(m);
    router.push(HOME[m]);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl(handle));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <div className="min-h-dvh lg:pl-[248px]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-rule bg-white px-4 py-6 lg:flex">
        <Link href={HOME[mode]} className="px-3 font-display text-[26px] font-extrabold tracking-tight">
          knil<span className="text-signal">.</span>
        </Link>
        <ModeSwitch mode={mode} onChange={switchTo} className="mt-4" />
        {mode === "creator" ? (
          <>
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-surface p-3">
              <Avatar name={page.profile.name} src={page.profile.avatar} size={40} />
              <div className="min-w-0">
                <p className="truncate text-[15px] font-bold">{page.profile.name}</p>
                <p className="truncate text-[12px] text-mute">@{handle}</p>
              </div>
            </div>
            <a href={`${BASE}/@${handle}`} target="_blank" rel="noopener" className="btn mt-3 h-11 gap-1.5 text-[14px]">
              내 페이지 보기 <ExternalLink size={15} />
            </a>
          </>
        ) : (
          <>
            <BrandSwitcher className="mt-4" />
            <a href={`${BASE}/@${handle}`} target="_blank" rel="noopener" className="btn mt-3 h-11 gap-1.5 text-[14px]">
              {clinic ? "병원" : "브랜드"} 페이지 보기 <ExternalLink size={15} />
            </a>
          </>
        )}
        <button onClick={copy} className="mt-2 flex h-11 w-full items-center gap-2 rounded-[14px] bg-surface pr-1.5 pl-3.5 text-left">
          <Link2 size={15} className="shrink-0 text-mute" />
          <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">{displayUrl(handle)}</span>
          <span className={`flex h-8 shrink-0 items-center gap-1 rounded-[10px] px-2.5 text-[12px] font-bold ${copied ? "bg-ink text-white" : "bg-white text-ink"}`}>
            {copied ? <Check size={13} strokeWidth={3} /> : <Copy size={13} />} {copied ? "복사됨" : "복사"}
          </span>
        </button>
        <p className="mt-1.5 px-1 text-[11px] text-mute">SNS 프로필 링크에 붙여 넣으세요</p>
        <nav className="mt-5 space-y-0.5">
          {side.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] ${on(n) ? "bg-surface font-bold text-ink" : "text-ink/70 hover:bg-surface"}`}
            >
              <n.icon size={19} strokeWidth={on(n) ? 2.4 : 1.8} />
              {n.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className={`mx-auto pb-[calc(72px+env(safe-area-inset-bottom))] lg:pb-16 ${wide ? "max-w-[480px] lg:max-w-[1120px] lg:px-10" : "max-w-[480px] lg:max-w-[680px] lg:px-6"}`}>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 bg-white/90 px-4 pt-[env(safe-area-inset-top)] backdrop-blur lg:hidden">
          <Link href={HOME[mode]} className="font-display text-[22px] font-extrabold tracking-tight">
            knil<span className="text-signal">.</span>
          </Link>
          <ModeSwitch mode={mode} onChange={switchTo} compact />
          <span className="flex-1" />
          {(
            <>
              <button onClick={copy} aria-label="주소 복사" className="flex h-9 shrink-0 items-center gap-1 rounded-full bg-surface px-3 text-[12px] font-bold">
                <Copy size={14} /> {copied ? "복사됨" : "주소"}
              </button>
              <a href={`${BASE}/@${handle}`} target="_blank" rel="noopener" aria-label="내 페이지" className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-white">
                <ExternalLink size={16} />
              </a>
            </>
          )}
        </header>

        {children(page)}
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-rule bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <div className="mx-auto grid h-16 max-w-[480px] grid-cols-5">
          {tabs.map((t) => (
            <Link key={t.href} href={t.href} className={`flex flex-col items-center justify-center gap-1 text-[11px] ${on(t) ? "font-bold text-ink" : "text-mute"}`}>
              <span className={`grid h-7 w-12 place-items-center rounded-full ${on(t) ? "bg-surface text-ink" : ""}`}>
                <t.icon size={21} strokeWidth={on(t) ? 2.3 : 1.7} />
              </span>
              {t.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

// Creator / brand view switch. Top left on a computer, in the header on a phone.
function ModeSwitch({ mode, onChange, compact, className = "" }: { mode: Mode; onChange: (m: Mode) => void; compact?: boolean; className?: string }) {
  const opts: { key: Mode; label: string }[] = [
    { key: "creator", label: "크리에이터" },
    { key: "brand", label: "브랜드" },
  ];
  return (
    <div className={`grid grid-cols-2 rounded-full bg-surface p-1 ${compact ? "h-9 text-[12px]" : "h-11 text-[14px]"} ${className}`}>
      {opts.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={`rounded-full font-bold transition-colors ${compact ? "px-2.5" : ""} ${mode === o.key ? "bg-white text-ink shadow-sm" : "text-mute"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
