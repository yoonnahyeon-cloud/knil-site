import type { ReactNode } from "react";

// Latin words set inside Korean lines use the display face, nudged so their
// cap height sits with the Hangul rather than above it.
export function Latin({ children }: { children: ReactNode }) {
  return <span className="font-display font-[750] tracking-[-0.04em] [font-stretch:94%]">{children}</span>;
}
