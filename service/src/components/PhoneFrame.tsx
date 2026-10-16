"use client";

// An iPhone-sized screen (390 × 844 points, as on iPhone 14/15) drawn at
// `width` pixels wide, so the editor shows a page exactly as a visitor's
// phone lays it out. The screen scrolls on its own.
const SCREEN_W = 390;
const SCREEN_H = 844;
const BEZEL = 12;

export function PhoneFrame({ width, children }: { width: number; children: React.ReactNode }) {
  const outerW = SCREEN_W + BEZEL * 2;
  const scale = width / outerW;
  return (
    <div style={{ width, height: (SCREEN_H + BEZEL * 2) * scale }}>
      <div
        className="relative origin-top-left rounded-[60px] bg-ink shadow-[0_30px_80px_-24px_rgba(0,0,0,0.35)]"
        style={{ width: outerW, height: SCREEN_H + BEZEL * 2, padding: BEZEL, transform: `scale(${scale})` }}
      >
        <div className="relative isolate size-full overflow-hidden rounded-[48px] bg-white [clip-path:inset(0_round_48px)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex h-[54px] items-center justify-between rounded-t-[48px] bg-white/90 px-8 pt-1 backdrop-blur">
            <span className="w-14 text-center text-[16px] font-semibold tracking-normal">9:41</span>
            <span className="h-[34px] w-[124px] rounded-full bg-ink" />
            <span className="flex w-14 items-center justify-end gap-1">
              <svg width="18" height="12" viewBox="0 0 18 12" className="fill-ink">
                <rect x="0" y="8" width="3" height="4" rx="1" />
                <rect x="5" y="5" width="3" height="7" rx="1" />
                <rect x="10" y="2.5" width="3" height="9.5" rx="1" />
                <rect x="15" y="0" width="3" height="12" rx="1" />
              </svg>
              <span className="relative h-[12px] w-[25px] rounded-[4px] border border-ink/40 p-[1.5px]">
                <span className="block h-full w-[80%] rounded-[2px] bg-ink" />
              </span>
            </span>
          </div>
          <div className="no-scrollbar absolute inset-0 overflow-y-auto overscroll-contain pt-[54px]">{children}</div>
          <span className="pointer-events-none absolute bottom-2 left-1/2 z-10 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-ink" />
        </div>
      </div>
    </div>
  );
}
