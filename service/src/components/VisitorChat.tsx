"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Sparkles, X } from "lucide-react";
import { Avatar } from "@/components/CreatorPage";
import { visitorMessages, visitorSend } from "@/lib/chat";
import { ui } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import type { Profile } from "@/lib/types";

// The visitor's side of the chat, entirely in their language.
export function VisitorChat({ profile, lang, onClose }: { profile: Profile; lang: string; onClose: () => void }) {
  const t = ui(lang);
  const [tick, setTick] = useState(0);
  const list = useStore(() => visitorMessages(profile.handle), [profile.handle, tick]);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  const end = useRef<HTMLDivElement>(null);

  // New replies arrive from the server; look for them while the chat is open.
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 5000);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearInterval(id);
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => end.current?.scrollIntoView({ block: "end" }), [list?.length, state]);

  const send = async () => {
    const body = text.trim();
    if (!body || state === "sending") return;
    setState("sending");
    try {
      await visitorSend(profile.handle, lang, name.trim(), body);
      setText("");
      setState("idle");
      setTick((n) => n + 1);
    } catch {
      setState("error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink/40" onClick={onClose}>
      <div
        className="mx-auto mt-[max(24px,env(safe-area-inset-top))] flex w-full max-w-[480px] flex-1 flex-col overflow-hidden rounded-t-[28px] bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-rule px-4">
          <Avatar name={profile.name} src={profile.avatar} size={38} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold">{profile.name}</p>
            <p className="truncate text-[12px] text-mute">@{profile.handle}</p>
          </div>
          <button onClick={onClose} aria-label="close" className="grid size-9 place-items-center rounded-full bg-surface">
            <X size={18} />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto bg-surface/60 px-4 py-5">
          <p className="mx-auto mb-4 max-w-[300px] rounded-2xl bg-white px-4 py-3 text-center text-[13px] text-mute">{t.hello(profile.name)}</p>
          {list?.map((m) =>
            m.from === "visitor" ? (
              <div key={m.id} className="flex justify-end">
                <p className="max-w-[78%] whitespace-pre-wrap rounded-[20px] rounded-br-md bg-signal px-4 py-2.5 text-[15px] text-white">{m.visitor}</p>
              </div>
            ) : (
              <div key={m.id} className="flex items-end gap-2">
                <Avatar name={profile.name} src={profile.avatar} size={28} />
                <div className="max-w-[78%]">
                  {m.from === "ai" && (
                    <span className="mb-1 flex items-center gap-1 text-[11px] font-bold text-signal">
                      <Sparkles size={12} /> {t.ai}
                    </span>
                  )}
                  <p className="whitespace-pre-wrap rounded-[20px] rounded-bl-md bg-white px-4 py-2.5 text-[15px] shadow-sm">{m.visitor}</p>
                </div>
              </div>
            ),
          )}
          {!!list?.length && list.at(-1)?.from === "visitor" && <p className="pt-1 text-center text-[12px] text-mute">{t.waiting(profile.name)}</p>}
          {state === "sending" && (
            <div className="flex justify-end">
              <span className="rounded-full bg-white px-4 py-2 text-mute">···</span>
            </div>
          )}
          <div ref={end} />
        </div>

        <div className="shrink-0 border-t border-rule px-3 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          {!list?.length && (
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.yourName} maxLength={40} className="mb-2 w-full rounded-full bg-surface px-4 py-2.5 outline-none" />
          )}
          {state === "error" && <p className="mb-2 px-2 text-[13px] text-[#e5484d]">⚠︎</p>}
          <div className="flex items-end gap-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t.placeholder}
              rows={1}
              maxLength={1000}
              className="max-h-32 min-h-11 flex-1 resize-none rounded-[22px] bg-surface px-4 py-2.5 outline-none"
            />
            <button onClick={send} disabled={!text.trim() || state === "sending"} aria-label={t.send} className="grid size-11 shrink-0 place-items-center rounded-full bg-signal text-white disabled:opacity-30">
              <ArrowUp size={20} strokeWidth={2.6} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
