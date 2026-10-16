"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChartColumn,
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
import { BASE, displayUrl, publicUrl } from "@/lib/base";
import { getMyPage, useStore } from "@/lib/store";
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

// Sidebar on a computer, where there is room for every screen.
const SIDE: Nav[] = [
  { href: "/home", label: "홈", icon: House },
  { href: "/edit", label: "프로필 링크", icon: Link2 },
  { href: "/stats", label: "통계", icon: ChartColumn },
  { href: "/chat", label: "해외 팬 채팅", icon: MessageCircleMore },
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
  const page = useStore(getMyPage);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (page === null) router.replace("/");
  }, [page, router]);

  if (!page) return null;
  const handle = page.profile.handle;
  const on = (n: Nav) => path.endsWith(n.href) || !!n.also?.some((a) => path.endsWith(a));

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
        <Link href="/home" className="px-3 font-display text-[26px] font-extrabold tracking-tight">
          knil<span className="text-signal">.</span>
        </Link>
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-surface p-3">
          <Avatar name={page.profile.name} src={page.profile.avatar} size={40} />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold">{page.profile.name}</p>
            <p className="truncate text-[12px] text-mute">@{handle}</p>
          </div>
        </div>
        <a href={`${BASE}/@${handle}`} target="_blank" rel="noopener" className="btn-accent mt-3 h-11 gap-1.5 text-[14px]">
          내 페이지 보기 <ExternalLink size={15} />
        </a>
        <nav className="mt-6 space-y-0.5">
          {SIDE.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] ${on(n) ? "bg-soft font-bold text-signal" : "text-ink/80 hover:bg-surface"}`}
            >
              <n.icon size={19} strokeWidth={on(n) ? 2.4 : 1.8} />
              {n.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className={`mx-auto pb-[calc(72px+env(safe-area-inset-bottom))] lg:pb-16 ${wide ? "max-w-[480px] lg:max-w-[1120px] lg:px-10" : "max-w-[480px] lg:max-w-[680px] lg:px-6"}`}>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 bg-white/90 px-5 pt-[env(safe-area-inset-top)] backdrop-blur lg:hidden">
          <Link href="/home" className="font-display text-[22px] font-extrabold tracking-tight">
            knil<span className="text-signal">.</span>
          </Link>
          <button onClick={copy} className="ml-1 flex min-w-0 flex-1 items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-left text-[13px] font-semibold">
            <span className="truncate">{copied ? <span className="text-signal">주소를 복사했어요</span> : displayUrl(handle)}</span>
            <Copy size={13} className="shrink-0 text-mute" />
          </button>
          <a href={`${BASE}/@${handle}`} target="_blank" rel="noopener" aria-label="내 페이지" className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-white">
            <ExternalLink size={16} />
          </a>
        </header>

        {children(page)}
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-rule bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <div className="mx-auto grid h-16 max-w-[480px] grid-cols-5">
          {TABS.map((t) => (
            <Link key={t.href} href={t.href} className={`flex flex-col items-center justify-center gap-1 text-[11px] ${on(t) ? "font-bold text-ink" : "text-mute"}`}>
              <span className={`grid h-7 w-12 place-items-center rounded-full ${on(t) ? "bg-soft text-signal" : ""}`}>
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
