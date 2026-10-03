"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { GATE_EVENT, GATE_KEY, isEntered } from "@/lib/gate";

// A notice the visitor reads and agrees to before entering. It sits over the
// page without touching its layout; while it is up the page behind it can't
// be scrolled, tapped or tabbed into.
export function EntryNotice() {
  const [agreed, setAgreed] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const bodyId = useId();

  useEffect(() => {
    if (isEntered()) {
      setGone(true);
      return;
    }
    const others = Array.from(document.body.children).filter(
      (el) => !el.hasAttribute("data-gate") && el.tagName !== "SCRIPT",
    ) as HTMLElement[];
    others.forEach((el) => (el.inert = true));
    dialog.current?.focus({ preventScroll: true });
    return () => others.forEach((el) => (el.inert = false));
  }, []);

  const enter = () => {
    if (!agreed) return;
    try {
      sessionStorage.setItem(GATE_KEY, "1");
    } catch {}
    setLeaving(true);
    document.documentElement.setAttribute("data-entered", "");
    Array.from(document.body.children).forEach((el) => ((el as HTMLElement).inert = false));
    window.dispatchEvent(new Event(GATE_EVENT));
    ScrollTrigger.refresh();
    window.setTimeout(() => setGone(true), 450);
  };

  if (gone) return null;

  return (
    <div
      data-gate
      className={`fixed inset-0 z-[100] flex items-center justify-center overscroll-contain bg-ink/55 px-4 transition-opacity duration-[450ms] ${
        leaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      onTouchMove={(e) => {
        if (e.target === e.currentTarget) e.preventDefault();
      }}
    >
      <div
        ref={dialog}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        className="w-full max-w-[420px] bg-paper outline-none px-6 pt-7 pb-6 text-ink"
      >
        <p className="font-display text-[22px] font-[800] [font-stretch:92%]" aria-hidden="true">
          knil
        </p>
        <h2 id={titleId} className="t-head mt-8 text-[24px]">
          KNIL 사업 소개
        </h2>
        <div id={bodyId} className="mt-4 space-y-3 text-[15px] text-ink/80">
          <p>본 페이지는 KNIL의 사업 구상 및 서비스에 대한 이해를 돕기 위해 간략하게 제작된 소개 페이지입니다.</p>
          <p>페이지 내 모든 내용과 자료의 무단 복제, 배포 및 외부 공유를 금지합니다.</p>
        </div>

        <label className="mt-7 flex cursor-pointer items-start gap-3 border-t border-ink pt-4 text-[15px] font-medium">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="peer sr-only"
          />
          <span
            aria-hidden="true"
            className="mt-[3px] grid size-[18px] shrink-0 place-items-center border border-ink bg-paper transition-colors peer-checked:bg-ink peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink"
          >
            <svg viewBox="0 0 12 12" className={`size-[11px] ${agreed ? "opacity-100" : "opacity-0"}`}>
              <path d="M2 6.2 L4.8 9 L10 3" fill="none" stroke="#f7f6f2" strokeWidth="1.6" />
            </svg>
          </span>
          위 내용을 확인했으며 동의합니다.
        </label>

        <button
          type="button"
          disabled={!agreed}
          onClick={enter}
          className="mt-5 h-[52px] w-full bg-ink text-[16px] font-semibold text-paper transition-colors disabled:cursor-not-allowed disabled:bg-rule disabled:text-mute"
        >
          확인하고 입장하기
        </button>
      </div>
    </div>
  );
}
