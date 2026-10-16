"use client";

import { record } from "@/lib/store";
import type { Block, Page } from "@/lib/types";

const TONES = ["bg-tone-1", "bg-tone-2", "bg-tone-3", "bg-tone-4"];

// What a visitor sees at knil.com/@handle. `preview` turns off click
// tracking and navigation, for the live preview inside the editor.
export function CreatorPage({ page, preview = false }: { page: Page; preview?: boolean }) {
  const { profile } = page;
  const blocks = page.blocks.filter((b) => !b.hidden);

  const go = (target: string, url: string) => (e: React.MouseEvent) => {
    if (preview || !url) {
      e.preventDefault();
      return;
    }
    record({ kind: "click", handle: profile.handle, target });
  };

  return (
    <div className="mx-auto min-h-dvh max-w-[480px] bg-white">
      <header className="flex items-center justify-between border-b border-ink px-6 py-4">
        <span className="text-[15px] font-semibold">knil.com/@{profile.handle}</span>
        <span className="font-display text-[20px] font-bold tracking-tight">knil</span>
      </header>

      <div className="px-6 pb-14">
        <section className="flex items-center gap-4 py-7">
          <Avatar name={profile.name} src={profile.avatar} />
          <div className="min-w-0">
            <h1 className="truncate font-display text-[30px] font-extrabold leading-tight tracking-tight">{profile.name}</h1>
            <p className="truncate text-[14px] text-mute">
              @{profile.handle}
              {profile.bio && ` · ${profile.bio}`}
            </p>
          </div>
        </section>

        {blocks.map((b, i) => (
          <BlockView key={b.id} block={b} first={i === 0} go={go} name={profile.name} />
        ))}

        {blocks.length === 0 && <p className="border-t border-rule py-10 text-center text-mute">아직 추가된 링크가 없어요</p>}

        <p className="mt-14 text-center font-display text-[13px] font-bold tracking-tight text-mute">knil</p>
      </div>
    </div>
  );
}

export function Avatar({ name, src, size = 64 }: { name: string; src?: string; size?: number }) {
  return (
    <div
      className="grid shrink-0 place-items-center overflow-hidden rounded-full bg-ink font-display font-bold text-paper"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {src ? <img src={src} alt="" className="size-full object-cover" /> : (name.trim()[0] ?? "K").toUpperCase()}
    </div>
  );
}

type Go = (target: string, url: string) => (e: React.MouseEvent) => void;

function Head({ title, note }: { title: string; note?: string }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-4">
      <h2 className="text-[16px] font-bold tracking-tight">{title}</h2>
      {note && <span className="shrink-0 text-[13px] text-mute">{note}</span>}
    </div>
  );
}

const linkProps = (url: string) => ({ href: url || "#", target: "_blank", rel: "noopener" });

function BlockView({ block: b, first, go, name }: { block: Block; first: boolean; go: Go; name: string }) {
  const rule = first ? "border-t border-ink" : "border-t border-rule";

  switch (b.type) {
    case "channels": {
      const items = b.items.filter((c) => c.url || c.followers);
      if (!items.length) return null;
      return (
        <section className={`${rule} grid grid-cols-2`}>
          {items.map((c, i) => (
            <a
              key={c.id}
              {...linkProps(c.url)}
              onClick={go(`${b.id}:${c.id}`, c.url)}
              className={`flex items-baseline justify-between gap-2 border-b border-rule py-3.5 ${i % 2 ? "pl-4" : "border-r pr-4"}`}
            >
              <span className="truncate text-[15px] font-semibold">{c.platform}</span>
              <span className="shrink-0 text-[13px] text-mute">{c.followers}</span>
            </a>
          ))}
        </section>
      );
    }
    case "video":
      return (
        <section className={`${rule} py-5`}>
          <Head title={b.heading || "Video"} note={platformOf(b.url)} />
          <a {...linkProps(b.url)} onClick={go(b.id, b.url)} className="flex gap-4">
            <div className="relative aspect-video w-[46%] shrink-0 overflow-hidden bg-tone-2">
              {b.image && <img src={b.image} alt="" className="absolute inset-0 size-full object-cover" />}
              <span className="absolute inset-0 grid place-items-center">
                <svg width="20" height="22" viewBox="0 0 20 22" className="fill-white drop-shadow">
                  <path d="M0 0l20 11L0 22z" />
                </svg>
              </span>
              {b.duration && <span className="absolute right-1 bottom-1 bg-ink/80 px-1 text-[11px] text-white">{b.duration}</span>}
            </div>
            <div className="min-w-0 self-center">
              <p className="line-clamp-3 text-[15px] font-semibold leading-snug">{b.title}</p>
              {b.meta && <p className="mt-1 text-[13px] text-mute">{b.meta}</p>}
            </div>
          </a>
        </section>
      );
    case "gallery":
      return (
        <section className={`${rule} py-5`}>
          <Head title={b.title} note={b.note} />
          <div className="no-scrollbar -mr-6 flex gap-2 overflow-x-auto pr-6">
            {b.items.map((g, i) => (
              <a key={g.id} {...linkProps(g.url)} onClick={go(`${b.id}:${g.id}`, g.url)} className="w-[38%] shrink-0">
                <div className={`aspect-square overflow-hidden ${TONES[i % 4]}`}>
                  {g.image && <img src={g.image} alt="" className="size-full object-cover" />}
                </div>
                <p className="mt-1.5 truncate text-[13px] text-mute">{g.label}</p>
              </a>
            ))}
          </div>
        </section>
      );
    case "products":
      return (
        <section className={`${rule} py-5`}>
          <Head title={b.title} note={b.note || `${name}가 쓰는 제품`} />
          <div className="space-y-2">
            {b.items.map((p, i) => (
              <a key={p.id} {...linkProps(p.url)} onClick={go(`${b.id}:${p.id}`, p.url)} className="flex items-center gap-4">
                <div className={`size-14 shrink-0 overflow-hidden ${TONES[(i + 2) % 4]} opacity-80`}>
                  {p.image && <img src={p.image} alt="" className="size-full object-cover" />}
                </div>
                <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">{p.name}</span>
                <span className="shrink-0 text-[14px] text-mute">{p.price}</span>
              </a>
            ))}
          </div>
        </section>
      );
    case "link":
      return (
        <a {...linkProps(b.url)} onClick={go(b.id, b.url)} className={`${rule} flex items-start justify-between gap-4 py-5`}>
          <div className="min-w-0">
            <p className="text-[16px] font-bold tracking-tight">{b.title}</p>
            {b.sub && <p className="mt-0.5 text-[13px] text-mute">{b.sub}</p>}
          </div>
          <span className="shrink-0 text-[13px] text-mute">{b.label || "바로 가기"}</span>
        </a>
      );
  }
}

function platformOf(url: string) {
  if (/youtu/.test(url)) return "YouTube";
  if (/instagram/.test(url)) return "Instagram";
  if (/tiktok/.test(url)) return "TikTok";
  return undefined;
}
