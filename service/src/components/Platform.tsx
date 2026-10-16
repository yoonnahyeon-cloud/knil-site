import { AtSign, BookOpen, Music2, Play } from "lucide-react";
import type { Platform } from "@/lib/types";

// A small colored tile standing in for each platform's logo.
export function PlatformMark({ platform, size = 32 }: { platform: Platform; size?: number }) {
  const r = size * 0.3;
  const i = size * 0.55;
  const tile = (bg: string, child: React.ReactNode) => (
    <span className="grid shrink-0 place-items-center text-white" style={{ width: size, height: size, borderRadius: r, background: bg }}>
      {child}
    </span>
  );
  switch (platform) {
    case "Instagram":
      return tile(
        "radial-gradient(circle at 30% 107%, #fdf497 0%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
        <svg width={i} height={i} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>,
      );
    case "YouTube":
      return tile("#ff0033", <Play size={i * 0.85} fill="currentColor" strokeWidth={0} />);
    case "TikTok":
      return tile("#111", <Music2 size={i} strokeWidth={2.4} />);
    case "X":
      return tile("#111", <span style={{ fontSize: i, fontWeight: 800, lineHeight: 1 }}>𝕏</span>);
    case "Threads":
      return tile("#111", <AtSign size={i} strokeWidth={2.4} />);
    case "Xiaohongshu":
      return tile("#ff2442", <span style={{ fontSize: i * 0.8, fontWeight: 800, lineHeight: 1 }}>小</span>);
    case "Blog":
      return tile("#03c75a", <BookOpen size={i} strokeWidth={2.2} />);
  }
}
