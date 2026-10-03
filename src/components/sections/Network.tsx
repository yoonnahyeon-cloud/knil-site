"use client";

import { useRef } from "react";
import { Lines } from "@/components/brand/Lines";
import { Latin } from "@/components/brand/Latin";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { network } from "@/lib/content";

export function Network() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      // The figure is set once and holds still while the argument for it
      // scrolls past. Its only motion: the digits are laid down one by one.
      mm.add(MOTION_OK, () => {
        gsap.from("[data-digit]", {
          yPercent: 100,
          duration: 1.1,
          stagger: 0.07,
          ease: "power4.out",
          scrollTrigger: { trigger: "[data-figure]", start: "top 78%" },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-label="크리에이터 네트워크" className="relative bg-paper pt-[18svh] pb-[20svh]">
      <div className="grid-12 items-start">
        <div className="col-span-6 md:sticky md:top-[14svh] md:col-span-6">
          <p
            data-figure
            className="mask -mr-[0.1em] pr-[0.1em] font-display text-[clamp(120px,30vw,220px)] leading-[0.86] font-[800] tracking-[-0.06em] [font-stretch:88%] md:text-[min(21vw,40svh)]"
          >
            <span className="sr-only">1,400만+</span>
            <span className="flex" aria-hidden="true">
              {network.figure.split("").map((d, i) => (
                <span key={i} data-digit className="inline-block">
                  {d}
                </span>
              ))}
            </span>
          </p>
          <p className="mt-6 text-[15px] leading-[1.6] md:mt-8 md:text-[17px]">
            {network.figureLabel[0]}
            <br />
            <span className="font-semibold">{network.figureLabel[1]}</span>
          </p>
        </div>

        <div className="col-span-6 mt-[14svh] md:col-start-8 md:col-span-5 md:mt-[34svh]">
          <Lines
            as="p"
            lines={network.connected}
            className="t-head text-[clamp(24px,2.5vw,42px)]"
            animate={false}
          />

          <dl className="mt-[clamp(28px,4vw,56px)] border-t border-ink text-[15px] md:text-[16px]">
            {network.sources.map((s) => (
              <div key={s.name} className="flex items-baseline justify-between gap-6 border-b border-rule py-4">
                <dt className="font-semibold">{s.name}</dt>
                <dd className="text-right text-mute">{s.detail}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-[22svh]">
            <Lines
              as="h2"
              lines={[
                <>
                  <Latin>KNIL</Latin>은 사용자를
                </>,
                network.statement[1],
                network.statement[2],
              ]}
              className="t-display text-[clamp(30px,3.9vw,68px)]"
            />
            <p className="mt-[clamp(24px,3vw,44px)] max-w-[34em] text-[16px] leading-[1.8] text-ink/80 md:text-[17px]">
              {network.body}
            </p>
            <p className="mt-10 max-w-[38em] border-t border-rule pt-4 text-[12px] leading-[1.7] text-mute md:text-[13px]">
              {network.footnote}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
