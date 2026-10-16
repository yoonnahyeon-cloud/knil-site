"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarCheck, ChartColumn, Handshake, Languages, Link2, type LucideIcon } from "lucide-react";
import { CreatorPage } from "@/components/CreatorPage";
import { PhoneFrame } from "@/components/PhoneFrame";
import { LANGS } from "@/lib/i18n";
import { brandSamples, showcase } from "@/lib/demo";
import { setPendingHandle } from "@/lib/pending";
import { LIVE, getSession, handleProblem, tryDemo } from "@/lib/store";

// Pastel panels in the brandazine manner: one strong line, one gray line.
const FEATURES: { title: string; body: string; icon: LucideIcon; bg: string; dark?: boolean; tag?: string }[] = [
  { title: "SNS, 영상, 상품, 일정을", body: "블록으로 쌓아 한 페이지에.", icon: Link2, bg: "bg-mist" },
  { title: "해외 팬과 고객의 메시지를", body: "한국어로 읽고 답하세요.", icon: Languages, bg: "bg-ink text-white", dark: true, tag: "13개 언어" },
  { title: "병원 · 브랜드는 상담 예약을", body: "외국어로 받아 채팅으로 확정.", icon: CalendarCheck, bg: "bg-sand" },
  { title: "브랜드와 크리에이터가", body: "제안하고 협의하는 곳.", icon: Handshake, bg: "bg-sage" },
  { title: "누가 무엇을 눌렀는지", body: "방문, 클릭, 유입 경로까지.", icon: ChartColumn, bg: "bg-lilac" },
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
      <header className="flex h-14 items-center justify-between px-5 pt-[env(safe-area-inset-top)]">
        <span className="font-display text-[24px] font-extrabold tracking-tight">
          knil<span className="text-signal">.</span>
        </span>
        <nav className="flex items-center gap-1.5 text-[14px]">
          {LIVE && (
            <Link href="/login" className="rounded-xl bg-surface px-3.5 py-2 font-semibold">
              로그인
            </Link>
          )}
          <Link href={begin} className="rounded-xl bg-ink px-3.5 py-2 font-semibold text-white">
            시작하기
          </Link>
        </nav>
      </header>

      <section className="px-5 pt-12 text-center">
        <span className="inline-flex items-center gap-2 rounded-xl bg-surface p-1 pr-3 text-[13px] font-semibold">
          <span className="rounded-lg bg-ink px-2 py-1 text-[11px] text-white">01</span> 프로필 링크
        </span>
        <h1 className="mt-5 text-[34px] font-extrabold leading-[1.2] tracking-[-0.05em]">
          모든 활동을 링크 하나로,
          <br />
          <span className="text-[#9a9a9a]">해외 팬과 고객까지.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-[300px] text-[15px] text-mute">크리에이터도, 브랜드와 병원도. 페이지를 꾸미고 13개 언어로 대화하세요.</p>
        <Claim onGo={(h) => (setPendingHandle(h), router.push(LIVE ? "/login" : `/start?h=${h}`))} />
      </section>

      <section className="mx-3 mt-8 overflow-hidden rounded-[32px] bg-surface pt-8 pb-6">
        <p className="px-6 text-[20px] font-extrabold leading-snug tracking-tight">
          방문자 휴대폰에서
          <br />
          <span className="text-[#9a9a9a]">보이는 그대로.</span>
        </p>
        <div className="no-scrollbar mt-6 flex snap-x snap-mandatory scroll-px-6 gap-4 overflow-x-auto px-6 pb-2">
          {[showcase[0], ...brandSamples, ...showcase.slice(1)].map((page) => (
            <button
              key={page.profile.handle}
              onClick={() => ["rosie", "moliv", "flowy"].includes(page.profile.handle) && router.push(`/@${page.profile.handle}`)}
              className="pointer-events-auto shrink-0 snap-start text-left"
            >
              <div className="pointer-events-none">
                <PhoneFrame width={CARD_W}>
                  <CreatorPage page={page} preview lang="ko" />
                </PhoneFrame>
              </div>
              <p className="mt-2 text-center text-[12px] font-semibold text-mute">knil.com/@{page.profile.handle}</p>
            </button>
          ))}
          <span className="w-1 shrink-0" />
        </div>
      </section>

      <section className="px-5 pt-14">
        <h2 className="text-[26px] font-extrabold leading-tight tracking-[-0.04em]">
          링크부터 협업까지
          <br />
          <span className="text-[#9a9a9a]">KNIL 하나로 해결하세요.</span>
        </h2>
        <div className="mt-6 space-y-2.5">
          {FEATURES.map((f) => (
            <div key={f.title} className={`relative flex min-h-36 flex-col justify-between rounded-[28px] p-5 ${f.bg}`}>
              <span className="flex items-start justify-between">
                <span className={`grid size-10 place-items-center rounded-2xl ${f.dark ? "bg-white/15" : "bg-white"}`}>
                  <f.icon size={20} />
                </span>
                {f.tag && <span className="rounded-lg bg-white px-2 py-0.5 text-[11px] font-bold text-ink">{f.tag}</span>}
              </span>
              <span className="mt-6">
                <span className="block text-[19px] font-extrabold leading-snug tracking-tight">{f.title}</span>
                <span className={`mt-0.5 block text-[15px] font-bold ${f.dark ? "text-white/50" : "text-ink/40"}`}>{f.body}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-5 mt-12 rounded-[28px] bg-surface p-5">
        <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-bold text-white">AI 해외 팬 채팅</span>
        <p className="mt-3 text-[22px] font-extrabold leading-tight tracking-tight">
          주소는 하나,
          <br />
          <span className="text-[#9a9a9a]">언어마다 다른 프로필</span>
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
        <Link href={begin} className="btn w-full gap-1.5">
          무료로 내 KNIL 만들기 <ArrowRight size={18} />
        </Link>
        <button onClick={demo} className="btn-ghost w-full">
          예시 계정으로 둘러보기
        </button>
        <p className="pt-2 text-center text-[12px] text-mute">위 페이지들은 예시로 만든 페이지예요.</p>
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
      <div className="flex h-14 items-center rounded-2xl bg-surface px-5 text-ink focus-within:ring-2 focus-within:ring-ink">
        <span className="shrink-0 font-semibold text-mute">knil.com/@</span>
        <input
          value={handle}
          onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/\s/g, ""))}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="아이디"
          aria-label="원하는 아이디"
          className="min-w-0 flex-1 bg-transparent font-semibold text-ink outline-none placeholder:font-normal placeholder:text-mute/60"
        />
      </div>
      <p className={`mt-1.5 h-5 px-2 text-left text-[13px] ${problem ? "text-danger" : "text-mute"}`}>
        {handle && (checking ? "확인하는 중…" : (problem ?? "사용할 수 있는 주소예요"))}
      </p>
      <button className="btn mt-1 w-full" disabled={!ok}>
        내 주소 만들기
      </button>
    </form>
  );
}
