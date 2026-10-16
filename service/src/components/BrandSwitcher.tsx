"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Plus } from "lucide-react";
import { Avatar } from "@/components/CreatorPage";
import { BRAND_ACCOUNTS, activeBrand, getBrand, setActiveBrand } from "@/lib/brand";
import { getPage, useStore } from "@/lib/store";

// The brand account in use, and the others this sign-in can switch to.
export function BrandSwitcher({ className = "", compact }: { className?: string; compact?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const list = useStore(() => Promise.all(BRAND_ACCOUNTS.map(async (a) => ({ handle: a.handle, page: await getPage(a.handle), brand: getBrand(a.handle) }))));
  const active = useStore(async () => activeBrand());
  const current = list?.find((a) => a.handle === active);
  if (!list || !current) return null;

  const pick = (handle: string) => {
    setOpen(false);
    if (handle === active) return;
    setActiveBrand(handle);
    router.push("/brand");
  };

  return (
    <div className={`relative ${className}`}>
      <button onClick={() => setOpen(!open)} className={`flex w-full items-center gap-3 rounded-2xl text-left ${compact ? "" : "bg-surface p-3"}`}>
        <Avatar name={current.page?.profile.name ?? current.brand.name} src={current.page?.profile.avatar} size={compact ? 36 : 40} />
        <span className="min-w-0 flex-1">
          <span className={`block truncate font-bold ${compact ? "text-[15px]" : "text-[14px] tracking-tight"}`}>{current.brand.name}</span>
          <span className="block truncate text-[12px] text-mute">{current.brand.kind}</span>
        </span>
        <span className={`flex h-8 shrink-0 items-center justify-center gap-0.5 rounded-full bg-ink text-[12px] font-bold text-white ${compact ? "pr-2 pl-3" : "w-8"}`}>
          {compact && "전환"} <ChevronDown size={15} strokeWidth={2.6} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 top-[calc(100%+6px)] z-50 min-w-[240px] rounded-2xl bg-white p-1.5 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.25)] ring-1 ring-rule">
            <p className="px-3 pt-2 pb-1 text-[12px] font-semibold text-mute">브랜드 계정</p>
            {list.map((a) => (
              <button key={a.handle} onClick={() => pick(a.handle)} className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left hover:bg-surface">
                <Avatar name={a.page?.profile.name ?? a.brand.name} src={a.page?.profile.avatar} size={34} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-bold">{a.brand.name}</span>
                  <span className="block truncate text-[12px] text-mute">{a.brand.kind}</span>
                </span>
                {a.handle === active && <Check size={17} />}
              </button>
            ))}
            <div className="mt-1 flex items-center gap-3 rounded-xl px-2.5 py-2 text-mute">
              <span className="grid size-[34px] place-items-center rounded-full bg-surface">
                <Plus size={16} />
              </span>
              <span className="flex-1 text-[14px]">계정 추가</span>
              <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-bold">준비 중</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
