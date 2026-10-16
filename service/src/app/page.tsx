"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ChartColumn, Handshake, Languages, Link2, Sparkles, type LucideIcon } from "lucide-react";
import { CreatorPage } from "@/components/CreatorPage";
import { PhoneFrame } from "@/components/PhoneFrame";
import { LANGS } from "@/lib/i18n";
import { showcase } from "@/lib/demo";
import { setPendingHandle } from "@/lib/pending";
import { LIVE, getSession, handleProblem, tryDemo } from "@/lib/store";

const FEATURES: { title: string; body: string; icon: LucideIcon; bg: string; tag?: string }[] = [
  { title: "모든 활동을\n링크 하나에", body: "채널, 새 영상, 룩, 상품, 협업까지", icon: Link2, bg: "bg-signal text-white" },
  { title: "누가 무엇에\n반응했는지", body: "방문, 클릭, 유입 경로를 링크마다", icon: ChartColumn, bg: "bg-ink text-white" },
  { title: "해외 팬과\n자기 언어로 대화", body: "13개 언어 자동 번역, AI가 먼저 답장", icon: Languages, bg: "bg-[#ff5fa2] text-white", tag: "NEW" },
  { title: "브랜드 제안을\n한곳에서", body: "협업 프로필과 제안함", icon: Handshake, bg: "bg-soft text-ink" },
];

const CARD_W = 200;

export default function Home() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  // Signed in already (or just back from the login email): go straight on.
  useEffect(() => {
    getSession().then((s) => {
      if (s?.handle) router.replace("/home");
      else if (s) router.replace("/start");
      else setChecked(true);
    });
  }, [router]);

  const demo = () => {
    tryDemo();
    router.push("/home");
  };
  const begin = LIVE ? "/login" : "/start";

  return (
    <div className={`mx-auto min-h-dvh max-w-[480px] transition-opacity ${checked ? "" : "opacity-0"}`}>
      <section className="relative overflow-hidden rounded-b-[36px] bg-ink pb-10 text-white">
        <div className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-signal opacity-60 blur-[90px]" />
        <div className="pointer-events-none absolute top-60 -left-28 size-64 rounded-full bg-[#ff5fa2] opacity-30 blur-[90px]" />
        <header className="relative flex h-14 items-center justify-between px-5 pt-[env(safe-area-inset-top)]">
          <span className="font-display text-[24px] font-extrabold tracking-tight">
            knil<span className="text-signal">.</span>
          </span>
          <nav className="flex items-center gap-1 text-[14px]">
            {LIVE && (
              <Link href="/login" className="px-3 py-2 text-white/60">
                로그인
              </Link>
            )}
            <Link href={begin} className="rounded-full bg-white px-4 py-2 font-bold text-ink">
              무료로 시작
            </Link>
          </nav>
        </header>

        <div className="relative px-5 pt-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-semibold backdrop-blur">
            <Sparkles size={13} className="text-[#b9a6ff]" /> 크리에이터를 위한 단 하나의 링크
          </span>
          <h1 className="mt-4 text-[38px] font-extrabold leading-[1.15] tracking-[-0.05em]">
            모든 활동을
            <br />
            하나의 <span className="bg-[linear-gradient(90deg,#b9a6ff,#7c4dff)] bg-clip-text text-transparent">KNIL</span>로.
          </h1>
          <p className="mt-3 text-[15px] text-white/60">링크 하나에 모으고, 반응을 확인하고, 해외 팬과 대화하세요.</p>
          <Claim onGo={(h) => (setPendingHandle(h), router.push(LIVE ? "/login" : `/start?h=${h}`))} />
        </div>

        <div className="no-scrollbar relative mt-6 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-2">
          {showcase.map((page) => (
            <button
              key={page.profile.handle}
              onClick={() => page.profile.handle === "rosie" && router.push("/@rosie")}
              className="pointer-events-auto shrink-0 snap-start text-left"
            >
              <div className="pointer-events-none">
                <PhoneFrame width={CARD_W}>
                  <CreatorPage page={page} preview lang="ko" />
                </PhoneFrame>
              </div>
              <p className="mt-2 text-center text-[12px] text-white/50">knil.com/@{page.profile.handle}</p>
            </button>
          ))}
          <span className="w-1 shrink-0" />
        </div>
      </section>

      <section className="px-5 pt-12">
        <h2 className="text-[24px] font-extrabold leading-tight tracking-[-0.04em]">
          누구에게나 쉽게,
          <br />
          누구보다 강력하게
        </h2>
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          {FEATURES.map((f) => (
            <div key={f.title} className={`relative flex min-h-44 flex-col justify-between rounded-[24px] p-4 ${f.bg}`}>
              <span className="flex items-start justify-between">
                <span className="grid size-10 place-items-center rounded-2xl bg-white/20">
                  <f.icon size={20} />
                </span>
                {f.tag && <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-extrabold text-[#ff5fa2]">{f.tag}</span>}
              </span>
              <span>
                <span className="block whitespace-pre-line text-[16px] font-extrabold leading-snug">{f.title}</span>
                <span className="mt-1 block text-[12px] opacity-70">{f.body}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-5 mt-12 rounded-[28px] bg-surface p-5">
        <span className="rounded-full bg-signal px-2.5 py-1 text-[11px] font-bold text-white">해외 팬 채팅</span>
        <p className="mt-3 text-[22px] font-extrabold leading-tight tracking-tight">
          주소는 하나,
          <br />
          <span className="text-signal">언어마다 다른 프로필</span>
        </p>
        <p className="mt-1.5 text-[13px] text-mute">방문자 휴대폰 언어로 페이지가 번역되고, 팬이 자기 언어로 보낸 메시지를 한국어로 읽어요.</p>
        <div className="mt-4 grid grid-cols-5 gap-2">
          {LANGS.slice(0, 10).map((l) => (
            <span key={l.code} className="flex flex-col items-center gap-1 rounded-2xl bg-white py-2.5">
              <span className="text-[22px] leading-none">{l.flag}</span>
              <span className="text-[10px] font-semibold text-mute">{l.ko}</span>
            </span>
          ))}
        </div>
        <div className="mt-4 space-y-2 rounded-2xl bg-white p-3 text-[13px]">
          <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-signal px-3 py-2 text-white">リップは何番ですか？</p>
          <p className="w-fit max-w-[85%] rounded-2xl rounded-bl-md bg-surface px-3 py-2">
            <span className="mb-0.5 block text-[10px] font-bold text-signal">한국어로 보여요</span>립은 몇 번인가요?
          </p>
        </div>
      </section>

      <section className="space-y-2.5 px-5 pt-10 pb-[max(32px,env(safe-area-inset-bottom))]">
        <Link href={begin} className="btn-accent w-full gap-1.5">
          무료로 내 KNIL 만들기 <ArrowRight size={18} />
        </Link>
        <button onClick={demo} className="btn-ghost w-full border-rule">
          예시 계정으로 둘러보기
        </button>
        <p className="pt-2 text-center text-[12px] text-mute">위 페이지들은 예시로 만든 가상의 크리에이터예요.</p>
        {!LIVE && <p className="text-center text-[12px] text-mute">미리보기 버전이에요. 만든 페이지는 이 기기에만 저장돼요.</p>}
      </section>
    </div>
  );
}

// "knil.com/@ [아이디] 바로 만들기": check the address before sign-up.
function Claim({ onGo }: { onGo: (handle: string) => void }) {
  const [handle, setHandle] = useState("");
  const [problem, setProblem] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const h = new URLSearchParams(location.search).get("h");
    if (h) setHandle(h.toLowerCase());
  }, []);

  useEffect(() => {
    if (!handle) return setProblem(null);
    setChecking(true);
    const t = setTimeout(async () => {
      setProblem(await handleProblem(handle).catch(() => null));
      setChecking(false);
    }, 300);
    return () => clearTimeout(t);
  }, [handle]);

  const ok = handle && !problem && !checking;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (ok) onGo(handle);
      }}
      className="mt-7"
    >
      <div className="flex h-14 items-center rounded-full bg-white px-5 text-ink focus-within:ring-4 focus-within:ring-signal/40">
        <span className="shrink-0 font-semibold text-mute">knil.com/@</span>
        <input
          value={handle}
          onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/\s/g, ""))}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="아이디"
          aria-label="원하는 아이디"
          className="min-w-0 flex-1 bg-transparent font-semibold text-signal outline-none placeholder:font-normal placeholder:text-mute/60"
        />
      </div>
      <p className={`mt-1.5 h-5 px-2 text-[13px] ${problem ? "text-[#ff8fa3]" : "text-white/60"}`}>
        {handle && (checking ? "확인하는 중…" : (problem ?? "사용할 수 있는 주소예요"))}
      </p>
      <button className="btn-accent mt-1 w-full" disabled={!ok}>
        내 주소 만들기
      </button>
    </form>
  );
}
