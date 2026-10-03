"use client";

import { useRef } from "react";
import { Lines } from "@/components/brand/Lines";
import { Latin } from "@/components/brand/Latin";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { creatorPage } from "@/lib/content";

// Where each channel name sits while it is still "the website": an editorial
// spread of scattered words. x/y are fractions of the stage, size is the
// font size as a fraction of stage width. Order follows creatorPage.rows.
type Spot = { x: number; y: number; size: number };
const WIDE: Spot[] = [
  { x: 0.05, y: 0.13, size: 0.084 },
  { x: 0.55, y: 0.08, size: 0.068 },
  { x: 0.66, y: 0.42, size: 0.08 },
  { x: 0.09, y: 0.56, size: 0.06 },
  { x: 0.36, y: 0.28, size: 0.112 },
  { x: 0.52, y: 0.7, size: 0.074 },
  { x: 0.07, y: 0.8, size: 0.066 },
];
const NARROW: Spot[] = [
  { x: 0.06, y: 0.1, size: 0.15 },
  { x: 0.3, y: 0.22, size: 0.135 },
  { x: 0.06, y: 0.34, size: 0.16 },
  { x: 0.14, y: 0.47, size: 0.1 },
  { x: 0.5, y: 0.57, size: 0.17 },
  { x: 0.06, y: 0.69, size: 0.13 },
  { x: 0.44, y: 0.81, size: 0.14 },
];

function offsetWithin(el: HTMLElement, ancestor: HTMLElement) {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== ancestor) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y };
}

export function Channels() {
  const root = useRef<HTMLElement>(null);
  const { rows } = creatorPage;

  useGSAP(
    () => {
      const stage = root.current!.querySelector<HTMLElement>("[data-stage]")!;
      const labels = gsap.utils.toArray<HTMLElement>("[data-ch]", stage);

      const spot = (i: number) => {
        const w = stage.clientWidth;
        const h = stage.clientHeight;
        const s = (w / h < 1 ? NARROW : WIDE)[i];
        const base = parseFloat(getComputedStyle(labels[i]).fontSize);
        const at = offsetWithin(labels[i], stage);
        return { x: s.x * w - at.x, y: s.y * h - at.y, scale: (s.size * w) / base };
      };

      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            end: "+=240%",
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });

        tl.to({}, { duration: 0.25 });
        labels.forEach((el, i) => {
          tl.fromTo(
            el,
            { x: () => spot(i).x, y: () => spot(i).y, scale: () => spot(i).scale },
            { x: 0, y: 0, scale: 1, duration: 1, ease: "power3.inOut", immediateRender: true },
            0.25 + i * 0.035,
          );
        });
        tl.from("[data-rule]", { scaleX: 0, duration: 0.5, stagger: 0.03, ease: "power2.inOut" }, 0.95)
          .from("[data-ui]", { autoAlpha: 0, y: 14, duration: 0.4, stagger: 0.025 }, 1.05)
          .from("[data-caption]", { autoAlpha: 0, duration: 0.4 }, 1.25)
          .to({}, { duration: 0.35 })
          // The same page, seen from the other side: what each link received.
          .to("[data-meta]", { autoAlpha: 0, duration: 0.25 })
          .fromTo("[data-clicks]", { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.03 }, "<0.1")
          .from("[data-backside]", { autoAlpha: 0, duration: 0.3 }, "<")
          .to({}, { duration: 0.45 });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-label="하나의 KNIL" className="relative bg-paper">
      <div className="grid-12 pt-[22svh] pb-[10svh]">
        <Lines
          as="h2"
          lines={[
            creatorPage.heading[0],
            <>
              하나의 <Latin>KNIL</Latin>로.
            </>,
          ]}
          className="t-display col-span-6 text-[clamp(34px,5.9vw,108px)] md:col-span-10"
          animate={false}
        />
      </div>

      <div data-stage className="relative h-[100svh] overflow-hidden">
        <div className="grid-12 h-full content-center">
          <div
            data-caption
            className="col-span-6 mb-8 self-end text-[14px] text-mute md:col-span-3 md:mb-0 md:text-[clamp(15px,1.2vw,19px)]"
          >
            <p className="text-ink">흩어져 있던 활동이 하나의 주소로 모입니다.</p>
            <p data-backside className="mt-3">
              그리고 같은 페이지의 반대편에는 <span className="text-signal">누가 무엇을 눌렀는지</span>가 남습니다.
            </p>
          </div>

          {/* A creator's KNIL page, set in the site's own grid rather than a device frame. */}
          <div className="col-span-6 md:col-start-5 md:col-span-6 lg:col-span-5" role="img" aria-label="크리에이터 로지의 KNIL 페이지 예시">
            <div className="flex items-baseline justify-between pb-3 text-[13px] md:text-[clamp(13px,1.05vw,16px)]">
              <span data-ui className="font-medium">
                knil.com/<span className="text-mute">@{creatorPage.handle}</span>
              </span>
              <span data-clicks className="invisible text-right whitespace-nowrap text-signal">
                이번 주 클릭
              </span>
            </div>
            <div data-rule className="h-px origin-left bg-ink" />

            <div className="flex items-center gap-4 py-5 md:py-6">
              <div data-ui className="grid size-12 shrink-0 place-items-center rounded-full bg-ink text-[17px] font-semibold text-paper md:size-16 md:text-[20px]">
                로
              </div>
              <div data-ui>
                <p className="text-[19px] font-bold md:text-[clamp(21px,1.75vw,27px)]">{creatorPage.name}</p>
                <p className="text-[13px] text-mute md:text-[clamp(14px,1.1vw,17px)]">{creatorPage.bio}</p>
              </div>
            </div>

            <ul>
              {rows.map((r) => (
                <li key={r.channel} className="relative">
                  <div data-rule className="h-px origin-left bg-rule" />
                  <div className="grid grid-cols-[38%_1fr_auto] items-baseline gap-x-3 py-[clamp(10px,1.75svh,18px)]">
                    <span>
                      <span
                        data-ch
                        className="inline-block origin-top-left text-[15px] font-semibold whitespace-nowrap md:text-[clamp(16px,1.3vw,20px)]"
                      >
                        {r.channel}
                      </span>
                    </span>
                    <span data-ui className="truncate text-[14px] text-ink/70 md:text-[clamp(15px,1.15vw,18px)]">
                      {r.title}
                    </span>
                    <span className="relative min-w-[5ch] text-right text-[13px] tabular-nums md:text-[clamp(14px,1.05vw,16px)]">
                      <span data-meta data-ui className="inline-block text-mute">
                        {r.meta}
                      </span>
                      <span data-clicks className="invisible absolute top-0 right-0 font-semibold text-signal">
                        {r.clicks}
                      </span>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <div data-rule className="h-px origin-left bg-rule" />
          </div>
        </div>
      </div>
    </section>
  );
}
