"use client";

import { useRef } from "react";
import { Lines } from "@/components/brand/Lines";
import { Latin } from "@/components/brand/Latin";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { reverse } from "@/lib/content";

const statement = "t-display text-[clamp(34px,5.9vw,108px)]";

export function Reverse() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        // 1. The other side arrives from the right edge and takes the page.
        //    The right-aligned line underneath is uncovered by the edge itself.
        gsap
          .timeline({
            scrollTrigger: {
              trigger: "[data-flip-stage]",
              start: "top top",
              end: "+=130%",
              pin: true,
              scrub: 0.6,
            },
          })
          .fromTo(
            "[data-ink]",
            { clipPath: "inset(0% 0% 0% 100%)" },
            { clipPath: "inset(0% 0% 0% 0%)", ease: "power2.inOut", duration: 1 },
            0.15,
          )
          .to("[data-outward]", { xPercent: -6, ease: "none", duration: 1.15 }, 0)
          .to({}, { duration: 0.35 });

        // 2. What the link leaves behind, one signal at a time.
        const rows = gsap.utils.toArray<HTMLElement>("[data-signal]");
        gsap.set(rows, { autoAlpha: 0, y: 28 });
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: "[data-signal-stage]",
            start: "top top",
            end: () => `+=${rows.length * 70}%`,
            pin: true,
            scrub: 0.5,
          },
        });
        rows.forEach((row, i) => {
          if (i > 0) tl.to(rows[i - 1], { autoAlpha: 0.22, duration: 0.5, ease: "none" }, "<");
          tl.to(row, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" }, i === 0 ? 0 : "<");
          tl.to({}, { duration: 0.6 });
        });
        tl.to(rows, { autoAlpha: 1, duration: 0.5, ease: "none" }).to({}, { duration: 0.4 });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-label="링크를 반대로 바라보기" className="relative">
      <div data-flip-stage className="relative h-[100svh] overflow-hidden">
        <div className="grid-12 h-full content-start pt-[18svh]">
          <div data-outward className="col-span-6 md:col-span-10">
            <Lines as="h2" lines={reverse.outward} className={statement} start="top 75%" />
          </div>
        </div>

        <div
          data-ink
          className="absolute inset-0 bg-ink text-paper"
          style={{ clipPath: "inset(0% 0% 0% 100%)" }}
        >
          <div className="grid-12 h-full content-end pb-[16svh]">
            <h2 className={`${statement} col-span-6 text-right md:col-start-3 md:col-span-10`}>
              {reverse.inward.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
          </div>
        </div>
      </div>

      <div className="bg-ink text-paper">
        <div data-signal-stage className="grid-12 h-[100svh] content-center">
          <ol className="col-span-6 md:col-span-12">
            {reverse.signals.map((s) => (
              <li
                key={s.kind}
                data-signal
                className="grid grid-cols-6 gap-x-[var(--gutter)] border-t border-white/15 py-[clamp(14px,2.2svh,26px)] md:grid-cols-12 md:items-baseline"
              >
                <span className="col-span-6 mb-1 text-[14px] font-semibold text-signal md:col-span-2 md:mb-0 md:text-[clamp(15px,1.25vw,20px)]">
                  {s.kind}
                </span>
                <span className="t-head col-span-6 text-[clamp(26px,4.3vw,78px)] md:col-span-10">{s.text}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="grid-12 min-h-[100svh] content-center pb-[12svh]">
          <Lines
            as="p"
            lines={[
              <>
                <Latin>LINK</Latin>를 뒤집으면 <Latin>KNIL</Latin>
              </>,
            ]}
            className={`${statement} col-span-6 md:col-start-3 md:col-span-10`}
          />
          <Lines
            as="p"
            lines={reverse.close.slice(1)}
            className="t-head col-span-6 mt-[clamp(18px,2.4vw,40px)] text-[clamp(20px,2.6vw,46px)] text-white/55 md:col-start-3 md:col-span-10"
            start="top 88%"
          />
        </div>
      </div>
    </section>
  );
}
