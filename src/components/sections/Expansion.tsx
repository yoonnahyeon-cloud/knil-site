"use client";

import { useRef } from "react";
import { Lines } from "@/components/brand/Lines";
import { gsap, useGSAP, ScrollTrigger, MOTION_OK, MOTION_REDUCED } from "@/lib/gsap";
import { expansion } from "@/lib/content";

type Pt = { x: number; y: number };

// Every position on the stage is derived from its size, so the same
// choreography holds from a phone held upright to a wide desktop.
function layout(stage: HTMLElement) {
  const w = stage.clientWidth;
  const h = stage.clientHeight;
  const wide = w >= 768 && w / h > 0.9;
  const m = Math.min(72, Math.max(20, w * 0.042));

  const bigFont = wide ? Math.min(w * 0.135, h * 0.25) : w * 0.165;
  const stackFont = wide ? Math.min(w * 0.042, h * 0.072) : w * 0.078;
  const bizFont = wide ? stackFont : stackFont * 0.9;
  const step = stackFont * 1.32;
  const top = h * (wide ? 0.15 : 0.13);

  const big: Pt = { x: m, y: h * 0.6 - bigFont * 0.5 };
  const stack: Pt[] = [0, 1, 2, 3].map((i) => ({ x: m, y: top + i * step }));
  // Wide: the businesses open as a second column beside "비즈니스".
  // Narrow: they hang under it, indented, so nothing has to shrink to fit.
  const colX = wide ? w * 0.5 : m + w * 0.18;
  const colY = wide ? stack[3].y : stack[3].y + step * 1.35;
  const biz: Pt[] = expansion.businesses.map((_, j) => ({
    x: colX,
    y: colY + (stackFont - bizFont) * 0.8 + j * bizFont * 1.36,
  }));
  const note: Pt = { x: m, y: big.y + bigFont * 1.22 };

  return { w, h, wide, bigFont, stackFont, bizFont, big, stack, biz, note };
}

export function Expansion() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const stage = root.current!.querySelector<HTMLElement>("[data-stage]")!;
      const words = gsap.utils.toArray<HTMLElement>("[data-w]", stage);
      const biz = gsap.utils.toArray<HTMLElement>("[data-b]", stage);
      const notes = gsap.utils.toArray<HTMLElement>("[data-n]", stage);

      const L = () => layout(stage);
      const applyType = () => {
        const l = L();
        gsap.set(words, { fontSize: l.bigFont });
        gsap.set(biz, { fontSize: l.bizFont });
        gsap.set(notes, { x: l.note.x, y: l.note.y, maxWidth: l.wide ? l.w * 0.34 : l.w - l.note.x * 2 });
      };
      applyType();
      ScrollTrigger.addEventListener("refreshInit", applyType);

      const atBig = () => ({ x: L().big.x, y: L().big.y, scale: 1 });
      const below = () => ({ x: L().big.x, y: L().big.y + L().bigFont * 0.38, scale: 1 });
      const inStack = (i: number) => () => ({
        x: L().stack[i].x,
        y: L().stack[i].y,
        scale: L().stackFont / L().bigFont,
      });
      const fromData = () => ({ x: L().stack[2].x, y: L().stack[2].y, scale: L().stackFont / L().bizFont });
      const inColumn = (j: number) => () => ({ x: L().biz[j].x, y: L().biz[j].y, scale: 1 });

      const v = <T extends object>(fn: () => T, key: keyof T) => () => fn()[key] as number;
      const pos = (fn: () => { x: number; y: number; scale: number }) => ({
        x: v(fn, "x"),
        y: v(fn, "y"),
        scale: v(fn, "scale"),
      });

      const build = () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.inOut", duration: 1 } });
        tl.set(words[0], { ...pos(atBig), autoAlpha: 1 }, 0);
        words.slice(1).forEach((el) => tl.set(el, { ...pos(below), autoAlpha: 0 }, 0));
        biz.forEach((el) => tl.set(el, { ...pos(fromData), autoAlpha: 0 }, 0));
        tl.set(notes, { autoAlpha: 0 }, 0).set(notes[0], { autoAlpha: 1 }, 0);
        tl.to({}, { duration: 0.5 });

        // Each stage steps back into the line it builds, and the next one takes its place.
        for (let k = 1; k < words.length; k++) {
          const at = tl.duration();
          tl.to(words[k - 1], pos(inStack(k - 1)), at)
            .to(words[k], { ...pos(atBig), autoAlpha: 1 }, at + 0.18)
            .to(notes[k - 1], { autoAlpha: 0, duration: 0.3, ease: "none" }, at)
            .to(notes[k], { autoAlpha: 1, duration: 0.4, ease: "none" }, at + 0.55)
            .to({}, { duration: 0.6 });
        }

        // Business closes the line, and the new businesses come out of data.
        const at = tl.duration();
        tl.to(words[3], pos(inStack(3)), at);
        biz.forEach((el, j) => {
          tl.to(el, { ...pos(inColumn(j)), autoAlpha: 1, duration: 1.1 }, at + 0.35 + j * 0.12);
        });
        tl.to({}, { duration: 0.8 });
        return tl;
      };

      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const tl = build();
        ScrollTrigger.create({
          animation: tl,
          trigger: stage,
          start: "top top",
          end: "+=420%",
          pin: true,
          scrub: 0.7,
          invalidateOnRefresh: true,
        });
      });
      mm.add(MOTION_REDUCED, () => {
        const tl = build();
        tl.progress(1);
        const settle = () => tl.invalidate().progress(0).progress(1);
        window.addEventListener("resize", settle);
        return () => window.removeEventListener("resize", settle);
      });

      return () => {
        ScrollTrigger.removeEventListener("refreshInit", applyType);
        mm.revert();
      };
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

      <div data-stage className="relative h-[100svh] overflow-hidden">
        <ol className="sr-only">
          {expansion.stages.map((s) => (
            <li key={s.word}>
              {s.word}: {s.note}
            </li>
          ))}
          <li>데이터에서 이어지는 사업: {expansion.businesses.join(", ")}</li>
        </ol>
        <div aria-hidden="true">
          {expansion.stages.map((s, i) => (
            <span
              key={s.word}
              data-w
              className={`invisible absolute top-0 left-0 origin-top-left leading-none font-bold tracking-[-0.055em] whitespace-nowrap ${
                i === 2 ? "text-signal" : ""
              }`}
            >
              {s.word}
            </span>
          ))}
          {expansion.businesses.map((b) => (
            <span
              key={b}
              data-b
              className="invisible absolute top-0 left-0 origin-top-left leading-none font-semibold tracking-[-0.045em] whitespace-nowrap"
            >
              {b}
            </span>
          ))}
          {expansion.stages.map((s) => (
            <p
              key={s.word}
              data-n
              className="invisible absolute top-0 left-0 text-[15px] leading-[1.6] text-mute md:text-[17px]"
            >
              {s.note}
            </p>
          ))}
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
          멀티링크 구독료
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
