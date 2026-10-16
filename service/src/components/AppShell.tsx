"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BASE, displayUrl, publicUrl } from "@/lib/base";
import { getMyPage, useStore } from "@/lib/store";
import type { Page } from "@/lib/types";

const TABS = [
  { href: "/edit", label: "페이지" },
  { href: "/stats", label: "통계" },
  { href: "/dm", label: "자동 DM" },
];

// Signed-in frame: address bar on top, tabs at the bottom (thumb reach).
export function AppShell({ children }: { children: (page: Page) => React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
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
        <Link href="/settings" className="font-display text-[20px] font-bold tracking-tight" aria-label="설정">
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
        <div className="mx-auto grid h-16 max-w-[480px] grid-cols-3">
          {TABS.map((t) => {
            const on = path.replace(/\/$/, "").endsWith(t.href);
            return (
              <Link key={t.href} href={t.href} className={`grid place-items-center text-[14px] ${on ? "font-bold" : "text-mute"}`}>
                <span className={on ? "border-b-2 border-signal pb-0.5" : "pb-0.5"}>{t.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
