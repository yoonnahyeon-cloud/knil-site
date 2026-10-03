"use client";

import { useRef } from "react";
import { Latin } from "@/components/brand/Latin";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { sides } from "@/lib/content";

// Three parties, three lines. Each line comes up to full ink only while it is
// the one being read, so the sentence is assembled one party at a time.
export function Sides() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.utils.toArray<HTMLElement>("[data-side]").forEach((row) => {
          gsap.fromTo(
            row,
            { opacity: 0.14 },
            {
              opacity: 1,
              ease: "none",
              scrollTrigger: { trigger: row, start: "top 82%", end: "top 48%", scrub: true },
            },
          );
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-label="크리에이터, 브랜드, 팔로워" className="relative bg-paper pt-[16svh] pb-[18svh]">
      <ol className="grid-12">
        {sides.lines.map((l) => (
          <li
            key={l.who}
            data-side
            className="col-span-6 grid grid-cols-6 gap-x-[var(--gutter)] border-t border-ink py-[clamp(28px,5svh,64px)] md:col-span-12 md:grid-cols-12 md:items-baseline"
          >
            <p className="t-display col-span-6 text-[clamp(32px,5.2vw,96px)] md:col-span-8">
              <span className="text-mute">{l.who}에게는</span>
              <br />
              {l.gets}
            </p>
            <p className="col-span-6 mt-5 max-w-[30em] text-[16px] leading-[1.8] text-ink/80 md:col-span-4 md:mt-0 md:text-[clamp(16px,1.2vw,19px)]">
              {l.body}
            </p>
          </li>
        ))}
      </ol>

      <div className="grid-12 mt-[18svh]">
        <h2 className="t-head col-span-6 text-[clamp(26px,3.4vw,60px)] md:col-start-5 md:col-span-8">
          <Latin>KNIL</Latin>은 이 세 주체가 만나는
          <br />
          크리에이터 멀티 링크 플랫폼입니다.
        </h2>
      </div>
    </section>
  );
}
