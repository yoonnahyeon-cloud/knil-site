"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createPage, handleProblem } from "@/lib/store";

export default function Start() {
  const router = useRouter();
  const [handle, setHandle] = useState("");
  const [name, setName] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    const h = new URLSearchParams(location.search).get("h");
    if (h) setHandle(h.toLowerCase());
  }, []);

  const problem = handle ? handleProblem(handle) : null;
  const ready = handle && !problem && name.trim();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!ready) return;
    createPage(handle, name.trim());
    router.push("/edit");
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col px-6 pt-[max(24px,env(safe-area-inset-top))] pb-[max(24px,env(safe-area-inset-bottom))]">
      <button onClick={() => router.back()} className="-ml-1 self-start p-1 text-[22px] leading-none" aria-label="뒤로">
        ←
      </button>

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
            {problem ?? (handle ? "사용할 수 있는 주소예요" : "영문 소문자, 숫자, 마침표, 밑줄로 3~20자")}
          </span>
        </label>

        <label className="mt-6 block">
          <span className="text-[13px] text-mute">이름</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="페이지에 보일 이름" className="field" maxLength={30} />
          {touched && !name.trim() && <span className="mt-1.5 block text-[13px] text-signal">이름을 입력해 주세요</span>}
        </label>

        <div className="flex-1" />
        <button className="btn w-full" disabled={!ready}>
          시작하기
        </button>
      </form>
    </main>
  );
}
