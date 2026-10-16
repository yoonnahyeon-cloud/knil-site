"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { takePendingHandle } from "@/lib/pending";
import { LIVE, createPage, getSession, handleProblem } from "@/lib/store";

export default function Start() {
  const router = useRouter();
  const [handle, setHandle] = useState("");
  const [name, setName] = useState("");
  const [problem, setProblem] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const h = new URLSearchParams(location.search).get("h") ?? takePendingHandle();
    if (h) setHandle(h.toLowerCase());
    if (LIVE)
      getSession().then((s) => {
        if (!s || s.demo) router.replace("/login");
        else if (s.handle) router.replace("/edit");
      });
  }, [router]);

  // Check the address as it is typed, after a short pause.
  useEffect(() => {
    if (!handle) return setProblem(null);
    setChecking(true);
    const t = setTimeout(async () => {
      setProblem(await handleProblem(handle).catch(() => null));
      setChecking(false);
    }, 300);
    return () => clearTimeout(t);
  }, [handle]);

  const ready = handle && !problem && !checking && name.trim() && !busy;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    setBusy(true);
    setError("");
    try {
      await createPage(handle, name.trim());
      router.replace("/edit");
    } catch (err) {
      setError(err instanceof Error ? err.message : "만들지 못했어요");
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col px-6 pt-[max(24px,env(safe-area-inset-top))] pb-[max(24px,env(safe-area-inset-bottom))]">
      {!LIVE && (
        <button onClick={() => router.back()} className="-ml-1 self-start p-1 text-[22px] leading-none" aria-label="뒤로">
          ←
        </button>
      )}

      <form onSubmit={submit} className="flex flex-1 flex-col">
        <h1 className="mt-8 text-[26px] font-bold leading-snug tracking-[-0.04em]">
          내 KNIL 주소를
          <br />
          정해 주세요.
        </h1>

        <label className="mt-10 block">
          <span className="text-[13px] text-mute">주소</span>
          <div className="flex items-center border-b border-rule focus-within:border-ink">
            <span className="shrink-0 py-2.5 text-mute">knil.com/@</span>
            <input
              value={handle}
              onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/\s/g, ""))}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder="아이디"
              className="field border-0"
              autoFocus
            />
          </div>
          <span className={`mt-1.5 block text-[13px] ${problem ? "text-signal" : "text-mute"}`}>
            {!handle
              ? "영문 소문자, 숫자, 마침표, 밑줄로 3~20자"
              : checking
                ? "확인하는 중…"
                : (problem ?? "사용할 수 있는 주소예요")}
          </span>
        </label>

        <label className="mt-6 block">
          <span className="text-[13px] text-mute">이름</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="페이지에 보일 이름" className="field" maxLength={30} />
        </label>

        {error && <p className="mt-4 text-[13px] text-signal">{error}</p>}
        <div className="flex-1" />
        <button className="btn w-full" disabled={!ready}>
          {busy ? "만드는 중…" : "시작하기"}
        </button>
      </form>
    </main>
  );
}
