"use client";

import { useRef } from "react";
import { LetterSwap } from "@/components/brand/LetterSwap";
import { Latin } from "@/components/brand/Latin";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { finale } from "@/lib/content";
import { site } from "@/lib/site";

// The page empties itself out until only the name and the line are left.
export function Finale() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.set("[data-second]", { autoAlpha: 0, y: 24 });
        gsap.set("[data-last]", { autoAlpha: 0 });
        gsap
          .timeline({
            defaults: { ease: "power2.inOut" },
            scrollTrigger: {
              trigger: "[data-finale]",
              start: "top top",
              end: "+=220%",
              pin: true,
              scrub: 0.6,
            },
          })
          .to({}, { duration: 0.3 })
          .to("[data-second]", { autoAlpha: 1, y: 0, duration: 0.6 })
          .to({}, { duration: 0.6 })
          .to("[data-first], [data-second]", { autoAlpha: 0, duration: 0.5, ease: "none" })
          .to("[data-last]", { autoAlpha: 1, duration: 0.5, ease: "none" }, "-=0.1")
          .to({}, { duration: 0.6 });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-label="마무리" className="relative bg-paper">
      <div data-finale className="relative h-[100svh] overflow-hidden">
        <div className="grid-12 h-full content-center">
          <div className="col-span-6 md:col-start-2 md:col-span-10">
            <h2 data-first className="t-display text-[clamp(40px,7vw,128px)]">
              링크는
              <br />
              시작일 뿐입니다.
            </h2>
            <p data-second className="t-head mt-[clamp(28px,4svh,56px)] text-[clamp(20px,2.5vw,44px)]">
              크리에이터에게는 하나의 링크.
              <br />
              <span className="text-mute">
                <Latin>KNIL</Latin>에게는 새로운 데이터의 시작.
              </span>
            </p>
          </div>
        </div>

        <div data-last className="absolute inset-0 flex flex-col items-center justify-center">
          <LetterSwap
            mode="hover"
            className="font-display cursor-pointer text-[min(24vw,30svh)] leading-[0.82] font-[800] tracking-[-0.055em] [font-stretch:92%]"
          />
          <p className="mt-[min(3vw,4svh)] text-[clamp(16px,1.7vw,26px)] font-medium tracking-[-0.03em]">{site.slogan}</p>
        </div>
      </div>
    </section>
  );
}
