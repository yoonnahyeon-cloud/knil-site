"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BASE, displayUrl, publicUrl } from "@/lib/base";
import { getMyPage, useStore } from "@/lib/store";
import type { Page } from "@/lib/types";

// Bottom tabs. `also` lists the other screens that light up the same tab.
const TABS = [
  { href: "/home", label: "홈", also: [], icon: "M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z" },
  { href: "/edit", label: "링크", also: ["/stats"], icon: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" },
  { href: "/dm", label: "자동 DM", also: [], icon: "M21 3 3 10.5l7 2.5 2.5 7zM10 13l11-10" },
  { href: "/collab", label: "협업", also: [], icon: "M3 8h18v12H3zM8 8V5h8v3M3 13h18" },
  { href: "/menu", label: "전체", also: ["/settings", "/invite", "/membership"], icon: "M4 6h16M4 12h16M4 18h16" },
];

// Signed-in frame: address bar on top, tabs at the bottom (thumb reach).
export function AppShell({ children }: { children: (page: Page) => React.ReactNode }) {
  const router = useRouter();
  const path = usePathname().replace(/\/$/, "");
  const page = useStore(getMyPage);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (page === null) router.replace("/");
  }, [page, router]);

  if (!page) return null;
  const handle = page.profile.handle;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl(handle));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <div className="mx-auto min-h-dvh max-w-[480px] pb-[calc(64px+env(safe-area-inset-bottom))]">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-ink bg-paper/95 px-5 pt-[env(safe-area-inset-top)] backdrop-blur">
        <Link href="/home" className="font-display text-[20px] font-bold tracking-tight">
          knil
        </Link>
        <button onClick={copy} className="min-w-0 flex-1 truncate text-left text-[14px] font-semibold">
          {copied ? <span className="text-signal">주소를 복사했어요</span> : displayUrl(handle)}
        </button>
        <a href={`${BASE}/@${handle}`} target="_blank" rel="noopener" className="shrink-0 border border-ink px-3 py-1.5 text-[13px] font-semibold">
          내 페이지
        </a>
      </header>

      {children(page)}

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-rule bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto grid h-16 max-w-[480px] grid-cols-5">
          {TABS.map((t) => {
            const on = path.endsWith(t.href) || t.also.some((a) => path.endsWith(a));
            return (
              <Link key={t.href} href={t.href} className={`flex flex-col items-center justify-center gap-1 text-[11px] ${on ? "font-bold text-ink" : "text-mute"}`}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={on ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
                  <path d={t.icon} />
                </svg>
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
