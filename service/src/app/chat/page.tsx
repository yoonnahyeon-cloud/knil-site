"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUp, Bot, Building2, ChevronLeft, Globe, Languages, MessageCircleMore, Sparkles, Stethoscope, UserRound } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card, Empty, IconTile, PageTitle, SectionHead, Toggle } from "@/components/ui";
import { BASE } from "@/lib/base";
import { DEFAULT_CHAT, markRead, ownerReply, saveChatSettings, threadMessages, threads } from "@/lib/chat";
import { LANGS, langOf } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import type { ChatSettings, ChatThread, Page } from "@/lib/types";

export default function ChatPage() {
  return (
    <AppShell>
      {(page) => (
        <Suspense>
          <Chat page={page} />
        </Suspense>
      )}
    </AppShell>
  );
}

// Re-reads chats every few seconds while this screen is open.
function usePoll(ms = 5000) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), ms);
    return () => clearInterval(id);
  }, [ms]);
  return tick;
}

function Chat({ page }: { page: Page }) {
  const id = useSearchParams().get("c");
  return id ? <Conversation page={page} id={id} /> : <Inbox page={page} />;
}

const ago = (at: number) => {
  const m = Math.round((Date.now() - at) / 60000);
  if (m < 1) return "방금";
  if (m < 60) return `${m}분 전`;
  if (m < 1440) return `${Math.round(m / 60)}시간 전`;
  return new Date(at).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" });
};

function Inbox({ page }: { page: Page }) {
  const handle = page.profile.handle;
  const tick = usePoll();
  const list = useStore(() => threads(handle), [handle, tick]);
  const settings = page.chat ?? DEFAULT_CHAT;
  const unread = list?.reduce((s, t) => s + t.unread, 0) ?? 0;
  const who = page.kind === "brand" ? "고객" : "팬";

  return (
    <main className="px-5 pb-12">
      <PageTitle icon={MessageCircleMore} sub={`${who}이 자기 언어로 보내면 한국어로 읽고, 한국어로 답하면 ${who}의 언어로 전해져요.`}>
        {page.kind === "brand" ? "AI 해외 고객 상담" : "AI 해외 팬 채팅"}
      </PageTitle>

      <ChatSettingsCard page={page} settings={settings} />

      <SectionHead title={`대화 ${list?.length ?? 0}${unread ? ` · 새 메시지 ${unread}` : ""}`} icon={Languages} />
      {!list && <p className="py-10 text-center text-mute">불러오는 중…</p>}
      {list && list.length === 0 && (
        <Empty icon={MessageCircleMore} title="아직 받은 메시지가 없어요" body={settings.on ? "내 페이지의 메시지 버튼으로 대화가 시작돼요." : "위에서 메시지 버튼을 켜면 내 페이지에 나타나요."} />
      )}
      <div className="space-y-2">
        {list?.map((t) => (
          <ThreadRow key={t.id} t={t} />
        ))}
      </div>

      <SectionHead title="언어별 내 페이지" icon={Globe} />
      <p className="-mt-1 mb-3 text-[13px] text-mute">주소 하나로 방문자 휴대폰 언어에 맞춰 자동 번역돼요. 언어를 골라 미리 볼 수 있어요.</p>
      <div className="grid grid-cols-4 gap-2">
        {LANGS.map((l) => (
          <a key={l.code} href={`${BASE}/@${handle}?lang=${l.code}`} target="_blank" rel="noopener" className="flex flex-col items-center gap-1 rounded-2xl bg-surface py-3">
            <span className="text-[24px] leading-none">{l.flag}</span>
            <span className="w-full truncate px-1 text-center text-[11px] font-semibold">{l.name}</span>
          </a>
        ))}
      </div>
    </main>
  );
}

function ThreadRow({ t }: { t: ChatThread }) {
  const l = langOf(t.lang);
  return (
    <Link href={`/chat/?c=${t.id}`} className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-rule">
      <span className="relative grid size-12 shrink-0 place-items-center rounded-full bg-surface text-[24px]">
        {l.flag}
        {t.unread > 0 && <span className="absolute -top-0.5 -right-0.5 grid size-5 place-items-center rounded-full bg-signal text-[11px] font-bold text-white">{t.unread}</span>}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span className="truncate text-[15px] font-bold">{t.name || "방문자"}</span>
          <span className="shrink-0 text-[12px] text-mute">{l.ko}</span>
        </span>
        <span className={`block truncate text-[14px] ${t.unread ? "font-semibold text-ink" : "text-mute"}`}>{t.last}</span>
      </span>
      <span className="shrink-0 self-start pt-1 text-[11px] text-mute">{ago(t.at)}</span>
    </Link>
  );
}

const USES = [
  { icon: UserRound, label: "크리에이터", body: "해외 팬 질문, 제품 문의" },
  { icon: Stethoscope, label: "병원 · 클리닉", body: "외국인 환자 예약 상담" },
  { icon: Building2, label: "브랜드 · 매장", body: "해외 고객 응대" },
];

function ChatSettingsCard({ page, settings }: { page: Page; settings: ChatSettings }) {
  const [guide, setGuide] = useState(settings.guide);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  useEffect(() => setGuide(settings.guide), [settings.guide]);

  const save = async (next: ChatSettings) => {
    setState("saving");
    try {
      await saveChatSettings(page, next);
      setState("saved");
    } catch {
      setState("error");
    }
  };

  return (
    <Card>
      <div className="flex items-center gap-3">
        <IconTile icon={MessageCircleMore} tone="purple" />
        <div className="min-w-0 flex-1">
          <p className="font-bold">내 페이지에 메시지 버튼</p>
          <p className="text-[13px] text-mute">{settings.on ? "켜져 있어요" : "꺼져 있어요"}</p>
        </div>
        <Toggle on={settings.on} onChange={(on) => save({ ...settings, on })} label="메시지 버튼" />
      </div>
      <div className="mt-4 flex items-center gap-3 border-t border-rule pt-4">
        <IconTile icon={Bot} tone="ink" />
        <div className="min-w-0 flex-1">
          <p className="font-bold">AI가 먼저 답하기</p>
          <p className="text-[13px] text-mute">아래 메모와 내 페이지 내용으로만 답해요</p>
        </div>
        <Toggle on={settings.ai} onChange={(ai) => save({ ...settings, ai })} label="AI 답변" />
      </div>
      {settings.ai && (
        <div className="mt-4">
          <label className="text-[13px] font-semibold text-ink/70">AI 안내 메모</label>
          <textarea
            value={guide}
            onChange={(e) => (setGuide(e.target.value), setState("idle"))}
            rows={4}
            maxLength={2000}
            placeholder={"예) 진료 시간 평일 10–19시, 토요일 10–14시\n예약은 페이지의 '예약하기' 링크에서\n가격 문의는 상담 후 안내"}
            className="field resize-none"
          />
          <button onClick={() => save({ ...settings, guide })} disabled={state === "saving" || guide === settings.guide} className="btn-accent mt-3 h-11 w-full text-[14px]">
            {state === "saving" ? "저장하는 중…" : state === "saved" && guide === settings.guide ? "저장했어요" : "메모 저장"}
          </button>
        </div>
      )}
      {state === "error" && <p className="mt-2 text-center text-[13px] text-[#d93036]">저장하지 못했어요. 잠시 후 다시 시도해 주세요.</p>}
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-rule pt-4">
        {USES.map((u) => (
          <div key={u.label} className="rounded-2xl bg-surface p-2.5 text-center">
            <u.icon size={20} className="mx-auto text-signal" />
            <p className="mt-1 text-[12px] font-bold">{u.label}</p>
            <p className="text-[11px] leading-tight text-mute">{u.body}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Conversation({ page, id }: { page: Page; id: string }) {
  const router = useRouter();
  const handle = page.profile.handle;
  const tick = usePoll();
  const all = useStore(() => threads(handle), [handle, tick]);
  const msgs = useStore(() => threadMessages(handle, id), [handle, id, tick]);
  const t = all?.find((x) => x.id === id);
  const [text, setText] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  const [originals, setOriginals] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const l = langOf(t?.lang ?? "ko");

  useEffect(() => {
    if (t?.unread) markRead(handle, id);
  }, [t?.unread, handle, id]);
  useEffect(() => end.current?.scrollIntoView({ block: "end" }), [msgs?.length]);

  const send = async () => {
    const body = text.trim();
    if (!body || state === "sending") return;
    setState("sending");
    try {
      await ownerReply(handle, id, body);
      setText("");
      setState("idle");
    } catch {
      setState("error");
    }
  };

  return (
    <main className="flex min-h-[calc(100dvh-56px-72px)] flex-col lg:min-h-[calc(100dvh-64px)]">
      <div className="sticky top-14 z-20 flex items-center gap-3 border-b border-rule bg-white/95 px-3 py-2.5 backdrop-blur lg:top-0">
        <button onClick={() => router.push("/chat")} aria-label="뒤로" className="grid size-9 place-items-center rounded-full">
          <ChevronLeft size={22} />
        </button>
        <span className="grid size-10 place-items-center rounded-full bg-surface text-[20px]">{l.flag}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold">{t?.name || "방문자"}</p>
          <p className="text-[12px] text-mute">{l.ko}로 대화 중</p>
        </div>
        {t?.lang !== "ko" && (
          <button onClick={() => setOriginals(!originals)} className={`rounded-full px-3 py-1.5 text-[12px] font-bold ${originals ? "bg-ink text-white" : "bg-surface"}`}>
            원문
          </button>
        )}
      </div>

      <div className="flex-1 space-y-3 bg-surface/60 px-4 py-5">
        {msgs?.map((m) =>
          m.from === "owner" ? (
            <div key={m.id} className="flex flex-col items-end">
              <p className="max-w-[80%] whitespace-pre-wrap rounded-[20px] rounded-br-md bg-ink px-4 py-2.5 text-[15px] text-white">{m.ko}</p>
              {originals && m.visitor !== m.ko && <p className="mt-1 max-w-[80%] text-right text-[12px] text-mute">{m.visitor}</p>}
            </div>
          ) : (
            <div key={m.id} className="flex flex-col items-start">
              {m.from === "ai" && (
                <span className="mb-1 flex items-center gap-1 text-[11px] font-bold text-signal">
                  <Sparkles size={12} /> AI가 대신 답했어요
                </span>
              )}
              <p className={`max-w-[80%] whitespace-pre-wrap rounded-[20px] rounded-bl-md px-4 py-2.5 text-[15px] shadow-sm ${m.from === "ai" ? "bg-soft" : "bg-white"}`}>{m.ko}</p>
              {originals && m.visitor !== m.ko && <p className="mt-1 max-w-[80%] text-[12px] text-mute">{m.visitor}</p>}
            </div>
          ),
        )}
        <div ref={end} />
      </div>

      <div className="sticky bottom-[calc(64px+env(safe-area-inset-bottom))] border-t border-rule bg-white px-3 pt-2.5 pb-3 lg:bottom-0">
        {state === "error" && <p className="mb-2 px-2 text-[13px] text-[#d93036]">보내지 못했어요. 다시 시도해 주세요.</p>}
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t?.lang && t.lang !== "ko" ? `한국어로 쓰면 ${l.ko}로 번역돼요` : "메시지를 입력하세요"}
            rows={1}
            maxLength={1000}
            className="max-h-32 min-h-11 flex-1 resize-none rounded-[22px] bg-surface px-4 py-2.5 outline-none"
          />
          <button onClick={send} disabled={!text.trim() || state === "sending"} aria-label="보내기" className="grid size-11 shrink-0 place-items-center rounded-full bg-signal text-white disabled:opacity-30">
            <ArrowUp size={20} strokeWidth={2.6} />
          </button>
        </div>
      </div>
    </main>
  );
}
