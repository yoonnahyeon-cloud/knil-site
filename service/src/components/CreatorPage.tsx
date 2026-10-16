"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, CalendarCheck, Check, Clock, Globe, Mail, MapPin, MessageCircle, Phone, Play, Share } from "lucide-react";
import { CalendarView } from "@/components/CalendarView";
import { PlatformMark } from "@/components/Platform";
import { Field, Sheet } from "@/components/Sheet";
import { VisitorChat } from "@/components/VisitorChat";
import { BASE, publicUrl } from "@/lib/base";
import { pageTranslation, visitorSend } from "@/lib/chat";
import { LANGS, bookUi, detectLang, langOf, makeYours, translatePage, ui } from "@/lib/i18n";
import { record, sendProposal } from "@/lib/store";
import type { Block, Page } from "@/lib/types";

const TONES = ["bg-tone-1", "bg-tone-2", "bg-tone-3", "bg-tone-4"];

// What a visitor sees at knil.kr/@handle. `preview` turns off click
// tracking and navigation, for the live preview inside the editor; `lang`
// then fixes the language shown.
export function CreatorPage({ page: original, preview = false, lang: fixedLang }: { page: Page; preview?: boolean; lang?: string }) {
  const [lang, setLang] = useState(fixedLang ?? "ko");
  const [dict, setDict] = useState<Record<string, string> | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [sheet, setSheet] = useState<"propose" | "chat" | "lang" | "book" | null>(null);
  const [pick, setPick] = useState<string | null>(null);
  const [shared, setShared] = useState(false);
  const handle = original.profile.handle;

  // A visitor sees the page in their phone's language unless ?lang= says otherwise.
  useEffect(() => {
    if (fixedLang) return setLang(fixedLang);
    const q = new URLSearchParams(location.search).get("lang");
    setLang(q && LANGS.some((l) => l.code === q) ? q : detectLang());
  }, [fixedLang]);

  useEffect(() => {
    let alive = true;
    setDict(null);
    if (lang !== "ko") pageTranslation(handle, lang).then((d) => alive && setDict(d), () => {});
    return () => {
      alive = false;
    };
  }, [handle, lang, original.updatedAt]);

  const translated = !!dict && !showOriginal && Object.keys(dict).length > 0;
  const page = translated ? translatePage(original, dict) : original;
  const { profile } = page;
  const t = ui(lang);
  const bt = bookUi(lang);
  const chatOn = !!original.chat?.on;
  const blocks = page.blocks.filter((b) => !b.hidden);
  const brand = original.kind === "brand";
  // Booking requests travel through the chat, so they need it switched on.
  const canBook = chatOn && blocks.some((b) => b.type === "booking");
  const theme = profile.theme
    ? ({ "--color-signal": profile.theme, "--color-soft": `color-mix(in srgb, ${profile.theme} 12%, white)` } as React.CSSProperties)
    : undefined;

  const go = (target: string, url: string) => (e: React.MouseEvent) => {
    if (preview || !url) {
      e.preventDefault();
      return;
    }
    record({ kind: "click", handle, target });
  };

  const share = async () => {
    if (preview) return;
    try {
      if (navigator.share) await navigator.share({ title: profile.name, url: publicUrl(handle) });
      else {
        await navigator.clipboard.writeText(publicUrl(handle));
        setShared(true);
        setTimeout(() => setShared(false), 1500);
      }
    } catch {}
  };

  const open = (s: "propose" | "chat" | "lang" | "book") => !preview && setSheet(s);
  const book = (id?: string) => {
    setPick(id ?? null);
    open("book");
  };

  return (
    <div className="relative mx-auto min-h-dvh max-w-[480px] bg-white" style={theme}>
      <div className={`relative overflow-hidden bg-ink ${profile.cover ? "h-[210px]" : "h-[150px]"}`}>
        {profile.cover ? (
          <>
            <img src={profile.cover} alt="" className="absolute inset-0 size-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/10" />
          </>
        ) : profile.avatar ? (
          <img src={profile.avatar} alt="" className="absolute inset-0 size-full scale-125 object-cover opacity-70 blur-2xl" />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#2b2b2b_0%,#111111_100%)]" />
        )}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <button onClick={share} aria-label="share" className="grid size-10 place-items-center rounded-full bg-white/20 text-white backdrop-blur">
            {shared ? <Check size={18} /> : <Share size={18} />}
          </button>
          <button onClick={() => open("lang")} className="flex h-10 items-center gap-1.5 rounded-full bg-white/20 px-3.5 text-[13px] font-semibold text-white backdrop-blur">
            <Globe size={16} />
            {langOf(lang).name}
          </button>
        </div>
      </div>

      <section className="relative z-10 -mt-12 flex flex-col items-center px-6 text-center">
        <div className="rounded-full ring-4 ring-white">
          <Avatar name={profile.name} src={profile.avatar} size={96} />
        </div>
        <h1 className="mt-3 font-display text-[26px] font-extrabold leading-tight tracking-tight">{profile.name}</h1>
        <p className="mt-0.5 text-[14px] text-mute">@{handle}</p>
        {profile.bio && <p className="mt-2 max-w-[320px] text-[15px] leading-snug">{profile.bio}</p>}

        {brand ? (
          <div className="mt-5 flex w-full max-w-[340px] gap-2">
            {canBook && (
              <button onClick={() => book()} className="flex h-12 flex-[1.3] items-center justify-center gap-1.5 rounded-2xl bg-signal text-[14px] font-bold text-white">
                <CalendarCheck size={17} /> {bt.book}
              </button>
            )}
            {chatOn && (
              <button onClick={() => open("chat")} className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-2xl bg-surface text-[14px] font-bold">
                <MessageCircle size={17} /> {bt.chat}
              </button>
            )}
          </div>
        ) : (
          <div className="mt-5 flex w-full max-w-[340px] gap-2">
            <button onClick={() => open("propose")} className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-2xl bg-surface text-[14px] font-bold">
              <Mail size={17} /> {t.propose}
            </button>
            {chatOn && (
              <button onClick={() => open("chat")} className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-2xl bg-ink text-[14px] font-bold text-white">
                <MessageCircle size={17} /> {t.message}
              </button>
            )}
          </div>
        )}

        {lang !== "ko" && dict && Object.keys(dict).length > 0 && (
          <button onClick={() => setShowOriginal(!showOriginal)} className="mt-4 flex items-center gap-1.5 rounded-full bg-soft px-3 py-1.5 text-[12px] font-semibold text-signal">
            <Globe size={13} />
            {showOriginal ? langOf(lang).name : `${t.translated} · ${t.original}`}
          </button>
        )}
      </section>

      <div className="space-y-3 px-5 pt-7 pb-6">
        {blocks.map((b) => (
          <BlockView key={b.id} block={b} go={go} name={profile.name} lang={lang} t={(w) => (translated && dict?.[w]) || w} book={canBook ? book : undefined} />
        ))}
        {blocks.length === 0 && <p className="rounded-2xl bg-surface py-10 text-center text-mute">{t.empty}</p>}
      </div>

      <div className="flex justify-center pt-4 pb-10">
        <a href={preview ? undefined : `${BASE}/`} className="flex items-center gap-2 rounded-full border border-rule px-5 py-3 text-[13px] font-semibold">
          <span className="font-display text-[15px] font-extrabold tracking-tight">
            knil<span className="text-signal">.</span>
          </span>
          <span className="text-mute">{makeYours(lang)}</span>
        </a>
      </div>

      {chatOn && (
        <div className="pointer-events-none sticky bottom-0 flex justify-end px-5 pb-[max(20px,env(safe-area-inset-bottom))]">
          <button
            onClick={() => open("chat")}
            aria-label={t.message}
            className="pointer-events-auto grid size-14 place-items-center rounded-full bg-signal text-white shadow-[0_10px_30px_-6px_color-mix(in_srgb,var(--color-signal)_70%,transparent)]"
          >
            <MessageCircle size={26} />
          </button>
        </div>
      )}

      {sheet === "book" && (
        <BookingSheet
          page={original}
          shown={page}
          lang={lang}
          pick={pick}
          onClose={() => setSheet(null)}
          onChat={() => setSheet("chat")}
        />
      )}
      {sheet === "propose" && <ProposalSheet handle={handle} name={profile.name} onClose={() => setSheet(null)} />}
      {sheet === "chat" && <VisitorChat profile={original.profile} lang={lang} onClose={() => setSheet(null)} />}
      {sheet === "lang" && (
        <Sheet title={t.language} onClose={() => setSheet(null)}>
          <div className="grid grid-cols-2 gap-2 pt-2">
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  setLang(l.code);
                  setShowOriginal(false);
                  setSheet(null);
                }}
                className={`flex items-center gap-2 rounded-2xl px-4 py-3.5 text-left text-[15px] ${lang === l.code ? "bg-ink font-bold text-white" : "bg-surface"}`}
              >
                <span className="text-[20px]">{l.flag}</span>
                {l.name}
              </button>
            ))}
          </div>
        </Sheet>
      )}
    </div>
  );
}

export function Avatar({ name, src, size = 64 }: { name: string; src?: string; size?: number }) {
  return (
    <div
      className="grid shrink-0 place-items-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#3a3a3a,#111111)] font-display font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {src ? <img src={src} alt="" className="size-full object-cover" /> : (name.trim()[0] ?? "K").toUpperCase()}
    </div>
  );
}

type Go = (target: string, url: string) => (e: React.MouseEvent) => void;

function Head({ title, note }: { title: string; note?: string }) {
  return (
    <div className="mb-2.5 flex items-baseline justify-between gap-4 px-1">
      <h2 className="text-[16px] font-extrabold tracking-tight">{title}</h2>
      {note && <span className="shrink-0 text-[12px] text-mute">{note}</span>}
    </div>
  );
}

const linkProps = (url: string) => ({ href: url || "#", target: "_blank", rel: "noopener" });

function BlockView({ block: b, go, name, lang, t, book }: { block: Block; go: Go; name: string; lang: string; t: (s: string) => string; book?: (id?: string) => void }) {
  const bt = bookUi(lang);
  switch (b.type) {
    case "booking":
      return (
        <section className="pt-3">
          <Head title={b.title} note={b.note} />
          <div className="overflow-hidden rounded-3xl bg-surface">
            {b.items
              .filter((it) => it.name)
              .map((it) => (
                <button key={it.id} onClick={() => book?.(it.id)} className="flex w-full items-center gap-3 border-b border-white px-4 py-3.5 text-left last:border-0">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-bold">{it.name}</span>
                    {(it.duration || it.price) && <span className="text-[12px] text-mute">{[it.duration, it.price].filter(Boolean).join(" · ")}</span>}
                  </span>
                  <ArrowUpRight size={18} className="shrink-0 text-mute" />
                </button>
              ))}
            <div className="p-3 pt-1">
              <button onClick={() => book?.()} className="flex h-12 w-full items-center justify-center gap-1.5 rounded-2xl bg-signal text-[15px] font-bold text-white disabled:opacity-40" disabled={!book}>
                <CalendarCheck size={18} /> {bt.book}
              </button>
            </div>
          </div>
        </section>
      );
    case "place":
      return (
        <section className="pt-3">
          <Head title={b.title} />
          <div className="space-y-3 rounded-3xl bg-surface p-4">
            {b.address && (
              <p className="flex gap-2.5 text-[14px] leading-snug">
                <MapPin size={17} className="mt-0.5 shrink-0 text-signal" /> {b.address}
              </p>
            )}
            {b.hours && (
              <p className="flex gap-2.5 whitespace-pre-line text-[14px] leading-relaxed">
                <Clock size={17} className="mt-0.5 shrink-0 text-signal" /> {b.hours}
              </p>
            )}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {b.phone && (
                <a href={`tel:${b.phone.replace(/[^0-9+]/g, "")}`} onClick={go(`${b.id}:tel`, b.phone)} className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-white text-[14px] font-bold">
                  <Phone size={16} /> {bt.call}
                </a>
              )}
              {b.map && (
                <a {...linkProps(b.map)} onClick={go(`${b.id}:map`, b.map)} className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-white text-[14px] font-bold">
                  <MapPin size={16} /> {bt.map}
                </a>
              )}
            </div>
          </div>
        </section>
      );
    case "calendar":
      return <CalendarView block={b} lang={lang} t={t} onOpen={(e) => go(`${b.id}:${e.id}`, e.url)} />;
    case "channels": {
      const items = b.items.filter((c) => c.url || c.followers);
      if (!items.length) return null;
      return (
        <section className="grid grid-cols-2 gap-2">
          {items.map((c) => (
            <a key={c.id} {...linkProps(c.url)} onClick={go(`${b.id}:${c.id}`, c.url)} className="flex items-center gap-2.5 rounded-2xl bg-surface p-3">
              <PlatformMark platform={c.platform} size={34} />
              <span className="min-w-0">
                <span className="block truncate text-[14px] font-bold">{c.platform}</span>
                {b.showFollowers && c.followers && <span className="block text-[12px] text-mute">{c.followers}</span>}
              </span>
            </a>
          ))}
        </section>
      );
    }
    case "video":
      return (
        <section className="pt-3">
          <Head title={b.heading || "Video"} note={platformOf(b.url)} />
          <a {...linkProps(b.url)} onClick={go(b.id, b.url)} className="block overflow-hidden rounded-3xl bg-surface">
            <div className="relative aspect-video bg-tone-2">
              {b.image && <img src={b.image} alt="" className="absolute inset-0 size-full object-cover" />}
              <span className="absolute inset-0 grid place-items-center">
                <span className="grid size-14 place-items-center rounded-full bg-white/25 text-white backdrop-blur">
                  <Play size={24} fill="currentColor" strokeWidth={0} />
                </span>
              </span>
              {b.duration && <span className="absolute right-2.5 bottom-2.5 rounded-md bg-ink/80 px-1.5 py-0.5 text-[11px] font-semibold text-white">{b.duration}</span>}
            </div>
            <div className="px-4 py-3.5">
              <p className="line-clamp-2 text-[15px] font-bold leading-snug">{b.title}</p>
              {b.meta && <p className="mt-0.5 text-[12px] text-mute">{b.meta}</p>}
            </div>
          </a>
        </section>
      );
    case "gallery":
      return (
        <section className="pt-3">
          <Head title={b.title} note={b.note} />
          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
            {b.items.map((g, i) => (
              <a key={g.id} {...linkProps(g.url)} onClick={go(`${b.id}:${g.id}`, g.url)} className="w-[40%] shrink-0">
                <div className={`aspect-[4/5] overflow-hidden rounded-2xl ${TONES[i % 4]}`}>{g.image && <img src={g.image} alt="" className="size-full object-cover" />}</div>
                <p className="mt-1.5 truncate px-1 text-[13px] font-semibold">{g.label}</p>
              </a>
            ))}
          </div>
        </section>
      );
    case "products":
      return (
        <section className="pt-3">
          <Head title={b.title} note={b.note || `${name}'s picks`} />
          <div className="divide-y divide-rule overflow-hidden rounded-3xl bg-surface">
            {b.items.map((p, i) => (
              <a key={p.id} {...linkProps(p.url)} onClick={go(`${b.id}:${p.id}`, p.url)} className="flex items-center gap-3 p-3">
                <div className={`size-14 shrink-0 overflow-hidden rounded-xl ${TONES[(i + 1) % 4]}`}>{p.image && <img src={p.image} alt="" className="size-full object-cover" />}</div>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-bold">{p.name}</span>
                  <span className="text-[14px] font-extrabold text-signal">{p.price}</span>
                </span>
                <ArrowUpRight size={18} className="shrink-0 text-mute" />
              </a>
            ))}
          </div>
        </section>
      );
    case "link":
      return (
        <a {...linkProps(b.url)} onClick={go(b.id, b.url)} className="flex items-center gap-3 rounded-3xl bg-white p-4 ring-1 ring-rule shadow-[0_6px_20px_-12px_rgba(20,10,60,0.25)]">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[16px] font-extrabold tracking-tight">{b.title}</p>
            {b.sub && <p className="mt-0.5 truncate text-[13px] text-mute">{b.sub}</p>}
          </div>
          <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-ink px-3 py-1.5 text-[12px] font-bold text-white">
            {b.label || "Go"}
            <ArrowUpRight size={14} />
          </span>
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

// A brand's collaboration request; lands in the creator's 제안함.
export function ProposalSheet({
  handle,
  name,
  onClose,
  prefill,
  onSent,
}: {
  handle: string;
  name: string;
  onClose: () => void;
  prefill?: { brand: string; contact: string };
  onSent?: (p: { budget: string; message: string }) => void;
}) {
  const [f, setF] = useState({ brand: prefill?.brand ?? "", contact: prefill?.contact ?? "", budget: "", message: "" });
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const ok = f.brand.trim() && f.contact.trim().length >= 3 && f.message.trim();
  const set = (k: keyof typeof f) => (v: string) => setF({ ...f, [k]: v });

  const send = async () => {
    if (!ok || state === "sending") return;
    setState("sending");
    try {
      await sendProposal({ handle, brand: f.brand.trim(), contact: f.contact.trim(), budget: f.budget.trim(), message: f.message.trim() });
      onSent?.({ budget: f.budget.trim(), message: f.message.trim() });
      setState("sent");
    } catch {
      setState("error");
    }
  };

  return (
    <Sheet title={`${name}에게 협업 제안`} onClose={onClose}>
      {state === "sent" ? (
        <div className="py-16 text-center">
          <p className="text-[20px] font-bold">제안을 보냈어요.</p>
          <p className="mt-2 text-mute">{name}님이 확인하면 남겨주신 연락처로 답할 거예요.</p>
          <button onClick={onClose} className="btn-ghost mt-8 px-8">
            닫기
          </button>
        </div>
      ) : (
        <>
          <Field label="브랜드 · 회사명" value={f.brand} onChange={set("brand")} placeholder="KNIL 코스메틱" />
          <Field label="연락처" value={f.contact} onChange={set("contact")} placeholder="이메일 또는 전화번호" />
          <Field label="예산 (선택)" value={f.budget} onChange={set("budget")} placeholder="50만원, 제품 제공 등" />
          <Field label="제안 내용" value={f.message} onChange={set("message")} placeholder="협업 형태, 일정, 원하는 콘텐츠를 적어주세요" multiline />
          {state === "error" && <p className="mt-3 text-[13px] text-danger">보내지 못했어요. 잠시 후 다시 시도해 주세요.</p>}
          <button onClick={send} disabled={!ok || state === "sending"} className="btn-accent mt-8 w-full">
            {state === "sending" ? "보내는 중…" : "제안 보내기"}
          </button>
        </>
      )}
    </Sheet>
  );
}

// A visitor's booking request, in their language. It is sent as a chat
// message so the clinic sees it (in Korean) next to the conversation.
function BookingSheet({ page, shown, lang, pick, onClose, onChat }: { page: Page; shown: Page; lang: string; pick: string | null; onClose: () => void; onChat: () => void }) {
  const bt = bookUi(lang);
  const ko = bookUi("ko");
  const find = (p: Page) => p.blocks.flatMap((b) => (b.type === "booking" && !b.hidden ? b.items.filter((i) => i.name) : []));
  const items = find(shown);
  const itemsKo = find(page);
  const [f, setF] = useState({ item: pick ?? items[0]?.id ?? "", date: "", time: 1, name: "", contact: "", note: "" });
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const ok = f.item && f.date && f.name.trim() && f.contact.trim().length >= 3;
  const min = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const send = async () => {
    if (!ok || state === "sending") return;
    setState("sending");
    const lines = (u: typeof bt, item: string) =>
      [`📅 ${u.book}`, `${u.pick}: ${item}`, `${u.date}: ${f.date} · ${u.times[f.time]}`, `${u.name}: ${f.name.trim()}`, `${u.contact.split(" (")[0]}: ${f.contact.trim()}`, f.note.trim() && `${u.note.split(" (")[0]}: ${f.note.trim()}`]
        .filter(Boolean)
        .join("\n");
    try {
      await visitorSend(
        page.profile.handle,
        lang,
        f.name.trim(),
        lines(bt, items.find((i) => i.id === f.item)?.name ?? ""),
        lines(ko, itemsKo.find((i) => i.id === f.item)?.name ?? ""),
      );
      setState("sent");
    } catch {
      setState("error");
    }
  };

  return (
    <Sheet title={bt.book} onClose={onClose}>
      {state === "sent" ? (
        <div className="py-14 text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-soft text-signal">
            <Check size={30} strokeWidth={2.6} />
          </span>
          <p className="mt-5 text-[20px] font-bold">{bt.done}</p>
          <p className="mx-auto mt-2 max-w-[280px] text-mute">{bt.doneSub}</p>
          <button onClick={onChat} className="btn mt-8 px-8">
            {bt.openChat}
          </button>
        </div>
      ) : (
        <>
          <p className="mt-2 text-[13px] font-semibold text-ink/70">{bt.pick}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {items.map((i) => (
              <button key={i.id} onClick={() => setF({ ...f, item: i.id })} className={`rounded-full px-3.5 py-2 text-[14px] font-semibold ${f.item === i.id ? "bg-ink text-white" : "bg-surface"}`}>
                {i.name}
              </button>
            ))}
          </div>
          <Field label={bt.date} type="date" value={f.date} onChange={(date) => setF({ ...f, date: date && date < min ? min : date })} />
          <p className="mt-4 text-[13px] font-semibold text-ink/70">{bt.time}</p>
          <div className="mt-1.5 grid grid-cols-3 gap-1.5">
            {bt.times.map((label, i) => (
              <button key={label} onClick={() => setF({ ...f, time: i })} className={`h-11 rounded-xl text-[14px] font-semibold ${f.time === i ? "bg-ink text-white" : "bg-surface"}`}>
                {label}
              </button>
            ))}
          </div>
          <Field label={bt.name} value={f.name} onChange={(name) => setF({ ...f, name })} />
          <Field label={bt.contact} value={f.contact} onChange={(contact) => setF({ ...f, contact })} />
          <Field label={bt.note} value={f.note} onChange={(note) => setF({ ...f, note })} multiline />
          {state === "error" && <p className="mt-3 text-[13px] text-danger">⚠︎</p>}
          <button onClick={send} disabled={!ok || state === "sending"} className="btn-accent mt-8 w-full">
            {state === "sending" ? "…" : bt.submit}
          </button>
        </>
      )}
    </Sheet>
  );
}
