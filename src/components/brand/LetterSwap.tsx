"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK, MOTION_REDUCED } from "@/lib/gsap";

// The four letters are always rendered in LINK order. Each one travels to
// the slot it holds in KNIL, measured from an invisible KNIL set in the same
// type. Letters are white with `mix-blend-mode: difference` on a paper
// ground, so they read as ink, and wherever two letters pass through each
// other the overlap flips back to paper. The reversal is visible in the
// crossing itself.
const LINK = ["L", "I", "N", "K"] as const;
const KNIL = ["K", "N", "I", "L"] as const;
const slotOf = (i: number) => 3 - i;

type Props = {
  className?: string;
  /** "intro": plays LINK to KNIL once on load. "hover": rests on KNIL, flips back to LINK on hover or tap. */
  mode: "intro" | "hover";
  delay?: number;
  onSettled?: () => void;
};

export function LetterSwap({ className = "", mode, delay = 0.7, onSettled }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const letters = gsap.utils.toArray<HTMLElement>("[data-letter]", el);
      const probes = gsap.utils.toArray<HTMLElement>("[data-probe]", el);

      // Offset as a percentage of each glyph's own width, so the result holds
      // at any font size and survives resizes without re-measuring.
      const shift = (i: number) => {
        const from = letters[i].getBoundingClientRect();
        const to = probes[slotOf(i)].getBoundingClientRect();
        const current = Number(gsap.getProperty(letters[i], "x")) || 0;
        return ((to.left - (from.left - current)) / from.width) * 100;
      };

      const build = () => {
        const tl = gsap.timeline({ paused: true, defaults: { ease: "expo.inOut" } });
        // Two swaps, read as two beats: L and K trade the ends of the word
        // (LINK to KINL), and as they land I and N trade the middle (KNIL).
        tl.to(letters[0], { xPercent: shift(0), duration: 0.82 }, 0)
          .to(letters[3], { xPercent: shift(3), duration: 0.82 }, 0)
          .to(letters[1], { xPercent: shift(1), duration: 0.56, ease: "expo.inOut" }, 0.58)
          .to(letters[2], { xPercent: shift(2), duration: 0.56, ease: "expo.inOut" }, 0.58);
        return tl;
      };

      const mm = gsap.matchMedia();
      let cancelled = false;

      document.fonts.ready.then(() => {
        if (cancelled) return;
        gsap.set(el, { autoAlpha: 1 });

        mm.add(MOTION_OK, () => {
          const tl = build();
          tlRef.current = tl;
          if (mode === "intro") {
            tl.eventCallback("onComplete", () => onSettled?.());
            gsap.delayedCall(delay, () => tl.play());
          } else {
            tl.progress(1);
          }
          return () => {
            tl.kill();
            tlRef.current = null;
          };
        });

        mm.add(MOTION_REDUCED, () => {
          const tl = build();
          tl.progress(1);
          onSettled?.();
          return () => tl.kill();
        });
      });

      return () => {
        cancelled = true;
        mm.revert();
      };
    },
    { scope: root },
  );

  const toLink = () => {
    if (mode === "hover") tlRef.current?.timeScale(1.25).reverse();
  };
  const toKnil = () => {
    if (mode === "hover") tlRef.current?.timeScale(1.25).play();
  };
  const toggle = () => {
    const tl = tlRef.current;
    if (!tl) return;
    if (mode === "intro") {
      // Replay on click: back to LINK, then forward again.
      tl.timeScale(1.6).reverse();
      tl.eventCallback("onReverseComplete", () => tl.timeScale(1).play());
      return;
    }
    tl.timeScale(1.25);
    if (tl.reversed() || tl.progress() === 0) tl.play();
    else tl.reverse();
  };

  return (
    <div
      ref={root}
      className={`relative isolate invisible -mx-[0.12em] select-none bg-paper px-[0.12em] ${className}`}
      onPointerEnter={(e) => e.pointerType === "mouse" && toLink()}
      onPointerLeave={(e) => e.pointerType === "mouse" && toKnil()}
      onClick={toggle}
    >
      <div className="relative">
      <div className="flex whitespace-nowrap" aria-hidden="true">
        {LINK.map((ch, i) => (
          <span
            key={ch}
            data-letter
            className="relative inline-block text-white mix-blend-difference will-change-transform"
            style={{ zIndex: i === 0 || i === 3 ? 2 : 1 }}
          >
            {ch}
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 flex whitespace-nowrap opacity-0" aria-hidden="true">
        {KNIL.map((ch) => (
          <span key={ch} data-probe className="inline-block">
            {ch}
          </span>
        ))}
      </div>
      </div>
    </div>
  );
}
