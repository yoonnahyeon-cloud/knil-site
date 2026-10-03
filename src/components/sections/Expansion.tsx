"use client";

import { useRef } from "react";
import { Lines } from "@/components/brand/Lines";
import { gsap, useGSAP, MOTION_OK, MOTION_REDUCED } from "@/lib/gsap";
import { expansion } from "@/lib/content";

// One stage at a time. A running line at the top shows where the reader is in
// the chain; the current stage is set large with a sentence that says what it
// means; at the last stage the businesses it opens are listed underneath.
export function Expansion() {
  const root = useRef<HTMLElement>(null);
  const { stages, businesses } = expansion;

  useGSAP(
    () => {
      const words = gsap.utils.toArray<HTMLElement>("[data-stage-item]");
      const trail = gsap.utils.toArray<HTMLElement>("[data-trail]");
      const biz = gsap.utils.toArray<HTMLElement>("[data-biz]");

      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.set(words.slice(1), { autoAlpha: 0, yPercent: 30 });
        gsap.set(trail.slice(1), { opacity: 0.28 });
        gsap.set(biz, { autoAlpha: 0, y: 18 });
        gsap.set("[data-progress]", { width: `${100 / stages.length}%` });

        const tl = gsap.timeline({
          defaults: { ease: "power3.inOut", duration: 0.7 },
          scrollTrigger: {
            trigger: "[data-expansion-stage]",
            start: "top top",
            end: "+=360%",
            pin: true,
            scrub: 0.6,
          },
        });
        tl.to({}, { duration: 0.4 });
        for (let k = 1; k < words.length; k++) {
          tl.to(words[k - 1], { autoAlpha: 0, yPercent: -30 })
            .to(words[k], { autoAlpha: 1, yPercent: 0 }, "<0.15")
            .to(trail[k], { opacity: 1, duration: 0.4, ease: "none" }, "<")
            .to("[data-progress]", { width: `${((k + 1) / stages.length) * 100}%`, duration: 0.6 }, "<")
            .to({}, { duration: 0.6 });
        }
        tl.to(biz, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.14, ease: "power2.out" }).to({}, { duration: 0.8 });
      });
      mm.add(MOTION_REDUCED, () => {
        gsap.set(words.slice(0, -1), { autoAlpha: 0 });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-label="링크 이후의 사업" className="relative bg-paper">
      <div className="grid-12 min-h-[90svh] content-center">
        <Lines
          as="h2"
          lines={expansion.opening}
          className="t-display col-span-6 text-[clamp(34px,5.9vw,108px)] md:col-span-10"
        />
      </div>

      <div data-expansion-stage className="relative flex h-[100svh] flex-col overflow-hidden pt-[clamp(72px,11svh,120px)]">
        <div className="frame">
          <ol className="flex flex-wrap gap-x-[clamp(14px,2.4vw,40px)] text-[15px] font-semibold md:text-[19px]">
            {stages.map((s, i) => (
              <li key={s.word} data-trail className={i === 2 ? "text-signal" : ""}>
                {s.word}
              </li>
            ))}
          </ol>
          <div className="mt-3 h-px bg-rule">
            <div data-progress className="relative h-full w-full bg-ink">
              <span
                aria-hidden="true"
                className="absolute top-1/2 right-0 size-[7px] -translate-y-1/2 rotate-45 border-t border-r border-ink"
              />
            </div>
          </div>
        </div>

        <div className="grid-12 mt-[clamp(40px,8svh,96px)] flex-1 content-start">
          <div className="relative col-span-6 md:col-span-6">
            {stages.map((s, i) => (
              <div
                key={s.word}
                data-stage-item
                className={i === 0 ? "relative" : "absolute inset-x-0 top-0"}
              >
                <p
                  className={`t-display text-[clamp(56px,15vw,176px)] whitespace-nowrap md:text-[min(11vw,19svh)] ${
                    i === 2 ? "text-signal" : ""
                  }`}
                >
                  {s.word}
                </p>
                <p className="mt-[clamp(14px,2svh,24px)] max-w-[22em] text-[17px] text-ink/75 md:text-[clamp(18px,1.5vw,24px)]">
                  {s.note}
                </p>
              </div>
            ))}
          </div>

          <div className="col-span-6 mt-[clamp(28px,5svh,56px)] md:col-start-8 md:col-span-5 md:mt-0">
          <p data-biz className="mb-2 text-[13px] text-mute md:text-[14px]">
            <span className="text-signal">데이터</span>에서 이어지는 사업
          </p>
          <ul>
            {businesses.map((b) => (
              <li
                key={b}
                data-biz
                className="border-b border-rule first:border-t first:border-t-ink py-[clamp(9px,1.5svh,16px)] text-[clamp(20px,5.6vw,24px)] font-semibold md:text-[clamp(22px,2vw,32px)]"
              >
                {b}
              </li>
            ))}
          </ul>
          </div>
        </div>
      </div>

      <div className="grid-12 pt-[14svh] pb-[22svh]">
        <p className="col-span-6 mb-[clamp(16px,2vw,28px)] text-[15px] text-mute md:col-start-1 md:col-span-6 md:text-[17px]">
          KNIL의 최종 목적은
        </p>
        <Purpose />
      </div>
    </section>
  );
}

// The sentence that carries the business model. The subscription fee is
// struck through as the line comes into view.
function Purpose() {
  const root = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from("[data-strike]", {
          scaleX: 0,
          duration: 0.9,
          ease: "power3.inOut",
          scrollTrigger: { trigger: root.current, start: "top 70%" },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <p ref={root} className="t-display col-span-6 text-[7.2vw] md:col-span-11 md:text-[clamp(30px,4.6vw,84px)]">
      <span className="text-mute">
        <span className="relative inline-block">
          멀티 링크 구독료
          <span
            data-strike
            aria-hidden="true"
            className="absolute top-[54%] -right-[0.04em] -left-[0.04em] h-[0.065em] origin-left bg-ink"
          />
        </span>
        가 아니라
      </span>
      <br />
      크리에이터와 행동 데이터를 쌓고,{" "}
      <br className="hidden md:block" />
      그것을 새로운 사업으로 연결하는 것.
    </p>
  );
}
