"use client";

import { useState } from "react";
import { Heart, MapPin, Send, Users, X } from "lucide-react";
import { Avatar, CreatorPage, ProposalSheet } from "@/components/CreatorPage";
import { PhoneFrame } from "@/components/PhoneFrame";
import { PlatformMark } from "@/components/Platform";
import { formatFollowers, getBrand, recordSent, toggleSaved, type Creator } from "@/lib/brand";
import type { Platform } from "@/lib/types";

// One creator in the brand's search results.
export function CreatorCard({ c, saved, onOpen }: { c: Creator; saved: boolean; onOpen: () => void }) {
  const { page } = c;
  const p = page.portfolio;
  return (
    <div className="rounded-[24px] bg-white p-4 ring-1 ring-rule">
      <div className="flex items-start gap-3">
        <button onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <Avatar name={page.profile.name} src={page.profile.avatar} size={52} />
          <span className="min-w-0">
            <span className="flex items-center gap-1.5">
              <span className="truncate text-[16px] font-extrabold">{page.profile.name}</span>
              {c.sample && <span className="shrink-0 rounded-full bg-surface px-1.5 py-0.5 text-[10px] font-bold text-mute">예시</span>}
            </span>
            <span className="block truncate text-[12px] text-mute">@{page.profile.handle}</span>
            <span className="mt-0.5 flex items-center gap-2 text-[12px] text-ink/70">
              <span className="flex items-center gap-0.5">
                <Users size={12} /> {c.followers ? formatFollowers(c.followers) : "–"}
              </span>
              {p?.region && (
                <span className="flex items-center gap-0.5">
                  <MapPin size={12} /> {p.region}
                </span>
              )}
            </span>
          </span>
        </button>
        <button onClick={() => toggleSaved(page.profile.handle)} aria-label="관심 크리에이터" className={`grid size-9 shrink-0 place-items-center rounded-full ${saved ? "bg-soft text-signal" : "bg-surface text-mute"}`}>
          <Heart size={17} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      {p?.intro && <p className="mt-3 line-clamp-2 text-[14px]">{p.intro}</p>}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {p?.categories.map((k) => (
          <span key={k} className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-bold text-white">
            {k}
          </span>
        ))}
        {p?.tags.slice(0, 3).map((t) => (
          <span key={t} className="rounded-full bg-soft px-2.5 py-1 text-[11px] font-semibold text-signal">
            #{t}
          </span>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-1.5">
        {c.channels.map((ch) => (
          <span key={ch.platform} className="flex items-center gap-1 rounded-full bg-surface py-1 pr-2.5 pl-1 text-[11px] font-bold">
            <PlatformMark platform={ch.platform as Platform} size={18} /> {ch.followers}
          </span>
        ))}
      </div>
    </div>
  );
}

// A creator's detail: their page as visitors see it, the numbers a brand
// asks about, and the proposal button.
export function CreatorSheet({ c, saved, onClose }: { c: Creator; saved: boolean; onClose: () => void }) {
  const [proposing, setProposing] = useState(false);
  const { page } = c;
  const p = page.portfolio;
  const brand = getBrand();
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink/40 backdrop-blur-[2px] lg:items-center lg:justify-center lg:p-8" onClick={onClose}>
      <div
        className="mx-auto mt-[max(16px,env(safe-area-inset-top))] flex w-full max-w-[480px] flex-1 flex-col overflow-hidden rounded-t-[28px] bg-white lg:mt-0 lg:max-h-[90dvh] lg:max-w-[880px] lg:flex-none lg:rounded-[28px]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex h-14 shrink-0 items-center justify-between px-4">
          <span className="font-bold">크리에이터 정보</span>
          <button onClick={onClose} aria-label="닫기" className="grid size-9 place-items-center rounded-full bg-surface">
            <X size={18} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 lg:grid lg:grid-cols-[1fr_300px] lg:gap-8">
          <div>
            <div className="flex items-center gap-3">
              <Avatar name={page.profile.name} src={page.profile.avatar} size={64} />
              <div className="min-w-0">
                <p className="truncate text-[22px] font-extrabold tracking-tight">{page.profile.name}</p>
                <p className="text-[13px] text-mute">@{page.profile.handle}</p>
              </div>
            </div>
            {p?.intro && <p className="mt-4 text-[15px]">{p.intro}</p>}

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Info label="전체 팔로워" value={c.followers ? formatFollowers(c.followers) : "–"} strong />
              <Info label="활동 지역" value={p?.region || "–"} />
              <Info label="주 시청층" value={p?.audience || "–"} />
              <Info label="카테고리" value={p?.categories.join(", ") || "–"} />
            </div>

            <div className="mt-4 space-y-2">
              {c.channels.map((ch) => (
                <div key={ch.platform} className="flex items-center gap-3 rounded-2xl bg-surface p-3">
                  <PlatformMark platform={ch.platform as Platform} size={30} />
                  <span className="flex-1 font-bold">{ch.platform}</span>
                  <span className="font-extrabold">{ch.followers}</span>
                </div>
              ))}
            </div>

            {p?.collabs && (
              <div className="mt-4 rounded-2xl bg-soft p-4">
                <p className="text-[12px] font-bold text-signal">광고 · 협찬 경험</p>
                <p className="mt-1 text-[14px]">{p.collabs}</p>
              </div>
            )}
            {!!p?.tags.length && <p className="mt-4 text-[13px] font-semibold text-signal">{p.tags.map((t) => `#${t}`).join(" ")}</p>}
          </div>

          <div className="mt-6 lg:mt-0">
            <p className="mb-2 text-center text-[12px] font-bold text-mute">KNIL 페이지</p>
            <div className="flex justify-center">
              <PhoneFrame width={260}>
                <CreatorPage page={page} preview lang="ko" />
              </PhoneFrame>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 gap-2 border-t border-rule px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          <button onClick={() => toggleSaved(page.profile.handle)} className={`btn-ghost h-12 w-14 shrink-0 border-rule px-0 ${saved ? "text-signal" : ""}`} aria-label="관심 크리에이터">
            <Heart size={20} fill={saved ? "currentColor" : "none"} />
          </button>
          <button onClick={() => setProposing(true)} className="btn-accent h-12 flex-1 gap-1.5">
            <Send size={17} /> 협업 제안하기
          </button>
        </div>
      </div>
      {proposing && (
        <div onClick={(e) => e.stopPropagation()}>
          <ProposalSheet
            handle={page.profile.handle}
            name={page.profile.name}
            prefill={{ brand: brand.name, contact: brand.contact }}
            onSent={(x) => recordSent({ handle: page.profile.handle, name: page.profile.name, ...x })}
            onClose={() => setProposing(false)}
          />
        </div>
      )}
    </div>
  );
}

function Info({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`rounded-2xl p-3 ${strong ? "bg-ink text-white" : "bg-surface"}`}>
      <p className={`text-[11px] ${strong ? "text-white/60" : "text-mute"}`}>{label}</p>
      <p className={`mt-0.5 truncate font-extrabold ${strong ? "text-[20px]" : "text-[14px]"}`}>{value}</p>
    </div>
  );
}
