"use client";

import { useRef } from "react";
import { Latin } from "@/components/brand/Latin";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { vision } from "@/lib/content";

// The long view, set on the dark side of the page. As each question is read,
// the thing KNIL would know about it turns to the data colour.
export function Vision() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.utils.toArray<HTMLElement>("[data-q]").forEach((row) => {
          const key = row.querySelector("[data-key]");
          gsap
            .timeline({ scrollTrigger: { trigger: row, start: "top 78%", end: "top 50%", scrub: true } })
            .fromTo(row, { opacity: 0.25 }, { opacity: 1, ease: "none" }, 0)
            .fromTo(key, { color: "#f7f6f2" }, { color: "#ff4b14", ease: "none" }, 0.3);
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-label="크리에이터 데이터 플랫폼" className="relative bg-ink pt-[18svh] pb-[20svh] text-paper">
      <div className="grid-12">
        <h2 className="t-display col-span-6 text-[clamp(34px,5.9vw,108px)] md:col-span-11">
          결국 <Latin>KNIL</Latin>은
          <br />
          {vision.heading[1]}
          <br />
          {vision.heading[2]}
        </h2>
        <p className="col-span-6 mt-6 max-w-[30em] text-[16px] leading-[1.8] text-white/65 md:col-span-6 md:mt-10 md:text-[18px]">
          {vision.lead}
        </p>
      </div>

      <ol className="grid-12 mt-[clamp(64px,12svh,128px)]">
        {vision.questions.map((q) => (
          <li
            key={q.key}
            data-q
            className="t-head col-span-6 border-t border-white/15 py-[clamp(18px,3svh,32px)] text-[clamp(26px,4.4vw,80px)] md:col-span-12"
          >
            {q.before}
            <span data-key>{q.key}</span>
            {q.after}
          </li>
        ))}
      </ol>

      <div className="grid-12 mt-[clamp(80px,16svh,160px)]">
        <p className="t-display col-span-6 text-[clamp(30px,4.8vw,88px)] md:col-start-3 md:col-span-10">
          {vision.close[0]}
          <br />
          {vision.close[1]}
        </p>
        <p className="col-span-6 mt-5 text-[17px] text-white/55 md:col-start-3 md:col-span-8 md:text-[clamp(18px,1.6vw,26px)]">
          그것이 <Latin>KNIL</Latin>이 만들어 가려는 미래입니다.
        </p>
      </div>
    </section>
  );
}
