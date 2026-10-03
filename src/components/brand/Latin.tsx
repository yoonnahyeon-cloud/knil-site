import type { ReactNode } from "react";

// Latin words set inside Korean lines use the display face, nudged so their
// cap height sits with the Hangul rather than above it.
export function Latin({ children }: { children: ReactNode }) {
  return <span className="font-display font-[750] [font-stretch:94%]">{children}</span>;
}
