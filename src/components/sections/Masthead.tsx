"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";

// A small lowercase knil that stays in the corner once the opening word has
// scrolled away. It is drawn with `difference`, so it inverts with the page
// whenever a section turns to the other side.
export function Masthead() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.set(root.current, { autoAlpha: 0 });
      ScrollTrigger.create({
        start: () => window.innerHeight * 0.7,
        onToggle: (self) =>
          gsap.to(root.current, { autoAlpha: self.isActive ? 1 : 0, duration: 0.3, ease: "none" }),
      });
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      className="pointer-events-none fixed inset-x-0 top-0 z-50 frame flex items-baseline justify-between pt-[clamp(16px,2.2vw,30px)] text-white mix-blend-difference"
    >
      <a href="#top" className="pointer-events-auto font-display text-[22px] leading-none font-[750] tracking-[-0.05em] md:text-[26px]">
        knil
      </a>
    </div>
  );
}
