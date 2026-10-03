"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";

type Props = {
  as?: ElementType;
  lines: ReactNode[];
  className?: string;
  lineClassName?: string;
  /** Start of the reveal, as a ScrollTrigger start string. */
  start?: string;
  /** Pass false to render static lines (a parent drives them instead). */
  animate?: boolean;
};

// Multi-line text that rises line by line out of its own baseline the first
// time it enters the viewport. Used for statements only, never for body copy.
export function Lines({
  as: Tag = "p",
  lines,
  className = "",
  lineClassName = "",
  start = "top 82%",
  animate = true,
}: Props) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!animate) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from(root.current!.querySelectorAll("[data-line]"), {
          yPercent: 104,
          duration: 1.05,
          stagger: 0.09,
          ease: "power4.out",
          scrollTrigger: { trigger: root.current, start },
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <Tag ref={root} className={className}>
      {lines.map((line, i) => (
        <span key={i} className={`mask ${lineClassName}`}>
          <span data-line>{line}</span>
        </span>
      ))}
    </Tag>
  );
}
