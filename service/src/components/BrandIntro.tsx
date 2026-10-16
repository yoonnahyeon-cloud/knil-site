"use client";

import { useEffect, useState } from "react";
import { Globe, Handshake, Languages, Megaphone, X, type LucideIcon } from "lucide-react";
import { IconTile, type Tone } from "@/components/ui";

// Shown each time the app is opened in the brand view, unless "오늘 하루 보지
// 않기" was picked in the last 24 hours.
const HIDE_UNTIL = "knil:brand:intro:until";
const SHOWN = "knil:brand:intro:shown";
const DAY = 24 * 60 * 60 * 1000;

const ITEMS: { icon: LucideIcon; tone: Tone; title: string; body: string; tags: string[] }[] = [
  {
    icon: Handshake,
    tone: "ink",
    title: "크리에이터 협업",
    body: "우리와 맞는 크리에이터를 찾아 바로 제안하고, 진행 상황을 한곳에서 관리해요.",
    tags: ["광고", "협찬", "시딩", "커머스 · 공동구매"],
  },
  {
    icon: Megaphone,
    tone: "purple",
    title: "캠페인 모집",
    body: "조건과 리워드만 정하면 여러 크리에이터를 한 번에 모집해요.",
    tags: ["제품 리뷰", "방문 후기", "팝업"],
  },
  {
    icon: Languages,
    tone: "sky",
    title: "해외 고객 AI 상담",
    body: "13개 언어 문의를 한국어로 읽고 답해요. AI가 먼저 답하고, 병원은 상담 예약까지 받아요.",
    tags: ["13개 언어", "AI 먼저 답장", "예약 요청"],
  },
  {
    icon: Globe,
    tone: "mint",
    title: "브랜드 페이지",
    body: "제품, 세일 · 팝업 일정, 예약, 오시는 길을 링크 하나에. 방문자 언어로 자동 번역돼요.",
    tags: ["링크 하나", "자동 번역"],
  },
];

// What a brand account can do, shown once when the brand view first opens.
export function BrandIntro({ open: forced, onClose }: { open?: boolean; onClose?: () => void }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (forced) return setOpen(true);
    try {
      if (Number(localStorage.getItem(HIDE_UNTIL) ?? 0) > Date.now()) return;
      if (sessionStorage.getItem(SHOWN)) return;
      setOpen(true);
    } catch {}
  }, [forced]);

  if (!open) return null;
  const close = (today?: boolean) => {
    try {
      sessionStorage.setItem(SHOWN, "1");
      if (today) localStorage.setItem(HIDE_UNTIL, String(Date.now() + DAY));
    } catch {}
    setOpen(false);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/40 backdrop-blur-[2px] lg:items-center lg:p-8" onClick={() => close()}>
      <div
        className="flex max-h-[92dvh] w-full max-w-[480px] flex-col overflow-hidden rounded-t-[28px] bg-white lg:rounded-[28px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-6 pb-4">
          <div className="flex items-start justify-between">
            <span className="inline-flex items-center gap-2 rounded-xl bg-surface p-1 pr-3 text-[12px] font-semibold">
              <span className="rounded-lg bg-ink px-2 py-0.5 text-[11px] text-white">KNIL</span> 브랜드 계정
            </span>
            <button onClick={() => close()} aria-label="닫기" className="grid size-9 place-items-center rounded-full bg-surface">
              <X size={18} />
            </button>
          </div>
          <h2 className="mt-5 text-[26px] font-extrabold leading-[1.25] tracking-[-0.04em]">
            크리에이터 협업부터
            <br />
            <span className="text-[#9a9a9a]">해외 고객 상담까지.</span>
          </h2>
          <p className="mt-2 text-[14px] text-mute">뷰티 · 패션 브랜드는 물론 병원 · 클리닉, 매장도 함께 쓸 수 있어요.</p>

          <div className="mt-6 space-y-2.5">
            {ITEMS.map((it) => (
              <div key={it.title} className="flex gap-3.5 rounded-[22px] bg-surface p-4">
                <IconTile icon={it.icon} tone={it.tone} size={42} />
                <div className="min-w-0">
                  <p className="text-[16px] font-extrabold tracking-tight">{it.title}</p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-ink/65">{it.body}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {it.tags.map((t) => (
                      <span key={t} className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="shrink-0 px-6 pt-2 pb-[max(20px,env(safe-area-inset-bottom))]">
          <button onClick={() => close()} className="btn w-full">
            시작하기
          </button>
          <button onClick={() => close(true)} className="mt-1 h-10 w-full text-[13px] font-semibold text-mute">
            오늘 하루 보지 않기
          </button>
        </div>
      </div>
    </div>
  );
}
