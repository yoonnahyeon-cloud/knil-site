"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Mail, MailCheck } from "lucide-react";
import { IconTile } from "@/components/ui";
import { sendLoginLink } from "@/lib/store";

// Email login: Supabase mails a one-tap link that brings the creator back
// to the home screen signed in. New and returning creators use the same flow.
export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setState("sending");
    setError("");
    try {
      await sendLoginLink(email.trim());
      setState("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "보내지 못했어요");
      setState("idle");
    }
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col px-6 pt-[max(24px,env(safe-area-inset-top))] pb-[max(24px,env(safe-area-inset-bottom))]">
      <button onClick={() => router.back()} className="-ml-2 grid size-10 place-items-center self-start rounded-full" aria-label="뒤로">
        <ChevronLeft size={24} />
      </button>

      {state === "sent" ? (
        <div className="flex flex-1 flex-col">
          <div className="mt-8">
            <IconTile icon={MailCheck} tone="purple" size={56} />
          </div>
          <h1 className="mt-5 text-[26px] font-bold leading-snug tracking-[-0.04em]">
            메일함을
            <br />
            확인해 주세요.
          </h1>
          <p className="mt-4 text-mute">
            <span className="font-semibold text-ink">{email}</span>로 로그인 링크를 보냈어요. 링크를 누르면 바로 시작돼요.
          </p>
          <div className="flex-1" />
          <button onClick={() => setState("idle")} className="btn-ghost w-full">
            다른 이메일로 받기
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-1 flex-col">
          <div className="mt-8">
            <IconTile icon={Mail} tone="ink" size={56} />
          </div>
          <h1 className="mt-5 text-[26px] font-bold leading-snug tracking-[-0.04em]">
            이메일로
            <br />
            시작해요.
          </h1>
          <p className="mt-2 text-mute">처음이면 가입, 이미 있으면 로그인돼요.</p>
          <label className="mt-10 block">
            <span className="text-[13px] font-semibold text-ink/70">이메일</span>
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="field"
              autoFocus
            />
          </label>
          {error && <p className="mt-2 text-[13px] text-danger">{error}</p>}
          <div className="flex-1" />
          <button className="btn-accent w-full" disabled={!valid || state === "sending"}>
            {state === "sending" ? "보내는 중…" : "로그인 링크 받기"}
          </button>
        </form>
      )}
    </main>
  );
}
