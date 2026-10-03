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
    <section ref={root} aria-label="크리에이터 산업의 데이터" className="relative bg-ink pt-[18svh] pb-[20svh] text-paper">
      <div className="grid-12">
        <h2 className="t-display col-span-6 text-[clamp(34px,5.9vw,108px)] md:col-span-11">
          {vision.heading[0]}
          <br />
          {vision.heading[1]}
        </h2>
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

      <div className="grid-12 mt-[clamp(48px,8svh,96px)]">
        <p className="col-span-6 max-w-[30em] text-[17px] text-white/65 md:col-start-1 md:col-span-7 md:text-[clamp(18px,1.6vw,26px)]">
          <Latin>KNIL</Latin>에는 {vision.lead}
        </p>
      </div>

      <div className="grid-12 mt-[clamp(80px,16svh,160px)]">
        <p className="col-span-6 mb-4 text-[17px] text-white/55 md:col-start-3 md:col-span-8 md:text-[clamp(18px,1.6vw,26px)]">
          그리고 결국 <Latin>KNIL</Latin>은
        </p>
        <p className="t-display col-span-6 text-[clamp(30px,4.8vw,88px)] md:col-start-3 md:col-span-10">
          {vision.close[0]}
          <br />
          {vision.close[1]}
        </p>
      </div>
    </section>
  );
}
