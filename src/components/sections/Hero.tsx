"use client";

import { useRef } from "react";
import { LetterSwap } from "@/components/brand/LetterSwap";
import { gsap, useGSAP } from "@/lib/gsap";
import { site } from "@/lib/site";

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const after = useRef<gsap.core.Timeline | null>(null);

  useGSAP(
    () => {
      gsap.set("[data-slogan]", { yPercent: 104 });
      gsap.set("[data-credit]", { autoAlpha: 0 });
      after.current = gsap
        .timeline({ paused: true })
        .to("[data-slogan]", { yPercent: 0, duration: 0.9, ease: "power4.out" })
        .to("[data-credit]", { autoAlpha: 1, duration: 0.6, stagger: 0.08, ease: "none" }, 0.35);
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="relative flex h-[100svh] min-h-[520px] flex-col items-center justify-center overflow-hidden"
    >
      <h1 className="sr-only">
        KNIL 크닐. {site.slogan}
      </h1>

      <LetterSwap
        mode="intro"
        className="font-display cursor-pointer text-[min(31vw,44svh)] leading-[0.82] font-[800] tracking-[-0.055em] [font-stretch:92%]"
        onSettled={() => after.current?.play()}
      />

      <p className="mask mt-[min(3.2vw,4svh)] text-[clamp(17px,1.9vw,30px)] font-medium tracking-[-0.03em]">
        <span data-slogan>{site.slogan}</span>
      </p>

      <div className="absolute inset-x-0 bottom-0 frame flex items-end pb-[clamp(20px,3.2vw,44px)] text-[12px] leading-[1.6] md:text-[13px]">
        <p data-credit className="text-mute">
          {site.parent}의 자회사
          <br />
          <span className="text-ink">{site.company}</span>
        </p>
      </div>
    </section>
  );
}
