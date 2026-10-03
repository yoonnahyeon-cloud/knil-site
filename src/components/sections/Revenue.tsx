"use client";

import { useRef } from "react";
import { Lines } from "@/components/brand/Lines";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { revenue } from "@/lib/content";

// The revenue plan read as a timeline: a single rule runs down the left edge
// and fills as the reader moves from 초기 to 장기. Each period's income lines
// slide in from the rule as it reaches them.
export function Revenue() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from("[data-axis]", {
          scaleY: 0,
          ease: "none",
          scrollTrigger: { trigger: "[data-phases]", start: "top 70%", end: "bottom 60%", scrub: true },
        });
        gsap.utils.toArray<HTMLElement>("[data-phase]").forEach((row) => {
          gsap.from(row.querySelectorAll("[data-income]"), {
            x: -24,
            autoAlpha: 0,
            duration: 0.7,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: { trigger: row, start: "top 66%" },
          });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const last = revenue.phases.length - 1;

  return (
    <section ref={root} aria-label="수익 모델" className="relative bg-paper pt-[16svh] pb-[20svh]">
      <div className="grid-12">
        <Lines as="h2" lines={revenue.heading} className="t-display col-span-6 text-[clamp(34px,5.9vw,108px)] md:col-span-10" />
        <p className="col-span-6 mt-[clamp(20px,3svh,36px)] max-w-[30em] text-[16px] text-ink/80 md:col-span-6 md:text-[clamp(17px,1.3vw,21px)]">
          {revenue.intro}
        </p>
      </div>

      <div className="grid-12 mt-[clamp(56px,10svh,120px)]">
        <ol data-phases className="relative col-span-6 md:col-span-10 md:col-start-2">
          <span aria-hidden="true" className="absolute top-0 bottom-0 left-0 w-px bg-rule" />
          <span data-axis aria-hidden="true" className="absolute top-0 bottom-0 left-0 w-px origin-top bg-ink" />
          {revenue.phases.map((p, i) => (
            <li
              key={p.when}
              data-phase
              className="grid grid-cols-[4.5em_1fr] gap-x-4 pl-5 pb-[clamp(44px,8svh,96px)] last:pb-0 md:grid-cols-[1fr_2fr] md:pl-10"
            >
              <p className="t-head text-[clamp(24px,6.4vw,30px)] md:text-[clamp(32px,3vw,52px)]">{p.when}</p>
              <div>
                <p className="text-[14px] text-mute md:text-[16px]">{p.aim}</p>
                <ul className="mt-3">
                  {p.items.map((it) => (
                    <li
                      key={it}
                      data-income
                      className={`border-b border-rule py-[clamp(8px,1.4svh,14px)] text-[clamp(19px,5.2vw,22px)] font-semibold md:text-[clamp(22px,2vw,32px)] ${
                        i === last ? "text-signal" : ""
                      }`}
                    >
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="grid-12 mt-[clamp(72px,14svh,160px)]">
        <Lines as="p" lines={revenue.close} className="t-head col-span-6 text-[clamp(22px,6vw,26px)] md:col-span-10 md:text-[clamp(28px,3.4vw,60px)]" />
      </div>
    </section>
  );
}
