"use client";

import { Fragment, useRef } from "react";
import { Lines } from "@/components/brand/Lines";
import { Latin } from "@/components/brand/Latin";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";
import { compare } from "@/lib/content";

// One ledger, three entries. The other services are set as plain entries with
// what they do well and where their data stops; KNIL's entry lists what each
// feature leaves behind, joined to it by a rule that draws as it is read.
export function Compare() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap
          .timeline({ scrollTrigger: { trigger: "[data-knil-rows]", start: "top 72%" } })
          .from("[data-join]", { scaleX: 0, duration: 0.6, stagger: 0.12, ease: "power2.inOut" })
          .from("[data-yield]", { autoAlpha: 0, x: -10, duration: 0.5, stagger: 0.12, ease: "power2.out" }, 0.35);
        gsap.from("[data-link-word]", {
          color: "#d9d7d0",
          duration: 0.35,
          stagger: 0.12,
          ease: "none",
          scrollTrigger: { trigger: "[data-chain]", start: "top 78%" },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-label="다른 링크 서비스와의 차이" className="relative bg-paper pt-[14svh] pb-[18svh]">
      <div className="grid-12">
        <Lines
          as="h2"
          lines={[
            compare.heading[0],
            <>
              <Latin>KNIL</Latin>은 무엇이 다른가요?
            </>,
          ]}
          className="t-head col-span-6 text-[clamp(26px,3.4vw,60px)] md:col-span-10"
        />
      </div>

      <div className="grid-12 mt-[clamp(40px,7svh,88px)]">
        <dl className="col-span-6 border-t border-ink md:col-span-12">
          {compare.others.map((o) => (
            <div key={o.name} className="grid grid-cols-6 gap-x-[var(--gutter)] border-b border-rule py-5 md:grid-cols-12 md:py-7">
              <dt className="col-span-6 md:col-span-3">
                <span className="t-head block text-[22px] md:text-[28px]">{o.name}</span>
                <span className="text-[13px] text-mute md:text-[14px]">{o.kind}</span>
              </dt>
              <dd className="col-span-6 mt-3 grid grid-cols-[3.2em_1fr] gap-x-3 gap-y-2 text-[15px] md:col-span-9 md:mt-0 md:grid-cols-[4em_1fr_4em_1.4fr] md:text-[16px]">
                <span className="text-mute">강점</span>
                <span>{o.strength}</span>
                <span className="text-mute">한계</span>
                <span className="text-ink/70">{o.limit}</span>
              </dd>
            </div>
          ))}

          <div className="grid grid-cols-6 gap-x-[var(--gutter)] border-b border-ink py-6 md:grid-cols-12 md:py-8">
            <dt className="col-span-6 md:col-span-3">
              <span className="t-head block text-[22px] md:text-[28px]">
                <Latin>KNIL</Latin>
              </span>
              <span className="text-[13px] text-mute md:text-[14px]">{compare.knil.kind}</span>
            </dt>
            <dd className="col-span-6 mt-3 md:col-span-9 md:mt-0">
              <p className="text-[15px] md:text-[16px]">{compare.knil.lead}</p>
              <ul data-knil-rows className="mt-3">
                {compare.knil.rows.map((r) => (
                  <li
                    key={r.feature}
                    className="grid grid-cols-[5.6em_1fr_auto] items-center gap-x-3 py-[7px] text-[15px] md:grid-cols-[8em_1fr_auto] md:text-[17px]"
                  >
                    <span className="font-semibold">{r.feature}</span>
                    <span data-join aria-hidden="true" className="h-px origin-left bg-ink/40" />
                    <span data-yield className="text-right text-signal">
                      {r.data}
                    </span>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>
      </div>

      <div className="grid-12 mt-[clamp(72px,12svh,140px)]">
        <Lines
          as="p"
          lines={[
            <>
              <Latin>KNIL</Latin>이 만드는 것은
            </>,
            compare.statement[1],
          ]}
          className="t-display col-span-6 text-[clamp(30px,4.8vw,88px)] md:col-span-11"
        />
        <p
          data-chain
          className="t-head col-span-6 mt-[clamp(28px,5svh,56px)] text-[clamp(20px,5.4vw,24px)] md:col-span-11 md:text-[clamp(26px,2.6vw,44px)]"
        >
          {compare.chain.map((w, i) => (
            <Fragment key={w}>
              <span className="whitespace-nowrap">
                {i > 0 && <span className="pr-[0.3em] font-normal text-mute">×</span>}
                <span data-link-word>{w}</span>
              </span>{" "}
            </Fragment>
          ))}
        </p>
        <p className="t-head col-span-6 mt-[clamp(28px,5svh,56px)] text-[clamp(22px,6vw,26px)] md:col-span-10 md:text-[clamp(28px,3.4vw,60px)]">
          <span className="text-mute">{compare.close[0]}</span>
          <br />
          크리에이터 비즈니스 <br className="md:hidden" />
          데이터 플랫폼입니다.
        </p>
      </div>
    </section>
  );
}
