"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreatorPage } from "@/components/CreatorPage";
import { showcase } from "@/lib/demo";
import { setPendingHandle } from "@/lib/pending";
import { LIVE, getSession, handleProblem, tryDemo } from "@/lib/store";

const FEATURES = [
  { title: "모든 활동을 한 페이지에", body: "채널, 새 영상, 룩, 상품, 브랜드 협업까지. 프로필의 링크 하나로 연결하세요." },
  { title: "누가 무엇에 반응했는지", body: "방문, 클릭, 유입 경로를 링크마다 확인하세요. 감이 아닌 데이터로 다음 콘텐츠를 정합니다." },
  { title: "댓글 하나에 링크가 도착", body: "댓글 키워드를 남긴 팔로워에게 DM과 링크를 자동으로 보냅니다.", soon: true },
];

const PREVIEW_W = 390;
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
        <span className="font-display text-[22px] font-bold tracking-tight">knil</span>
        <nav className="flex items-center gap-1 text-[14px]">
          {LIVE && (
            <Link href="/login" className="px-3 py-2 text-mute">
              로그인
            </Link>
          )}
          <Link href={begin} className="bg-ink px-3.5 py-2 font-semibold text-paper">
            무료로 시작
          </Link>
        </nav>
      </header>

      <section className="px-5 pt-12">
        <h1 className="text-[34px] font-bold leading-[1.25] tracking-[-0.04em]">
          크리에이터의
          <br />
          모든 활동을
          <br />
          하나의 KNIL로.
        </h1>
        <p className="mt-4 text-[16px] text-mute">링크 하나에 모으고, 누가 무엇에 반응했는지 확인하세요.</p>
        <Claim onGo={(h) => (setPendingHandle(h), router.push(LIVE ? "/login" : `/start?h=${h}`))} />
      </section>

      <section className="mt-14">
        <div className="no-scrollbar flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-2">
          {showcase.map((page) => (
            <button
              key={page.profile.handle}
              onClick={() => page.profile.handle === "rosie" && router.push("/@rosie")}
              className="shrink-0 snap-start text-left"
              style={{ width: CARD_W }}
            >
              <div className="overflow-hidden border border-ink bg-white" style={{ height: CARD_W * 1.9 }}>
                <div className="pointer-events-none origin-top-left" style={{ width: PREVIEW_W, transform: `scale(${CARD_W / PREVIEW_W})` }}>
                  <CreatorPage page={page} preview />
                </div>
              </div>
              <p className="mt-2 text-[13px] text-mute">knil.com/@{page.profile.handle}</p>
            </button>
          ))}
          <span className="w-2 shrink-0" />
        </div>
        <p className="px-5 text-[12px] text-mute">예시로 만든 가상의 크리에이터 페이지예요.</p>
      </section>

      <section className="mt-14 px-5">
        <ol className="border-t border-ink">
          {FEATURES.map((f, i) => (
            <li key={f.title} className="flex gap-4 border-b border-rule py-5">
              <span className="font-display text-[15px] font-bold text-mute">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <p className="text-[17px] font-bold tracking-tight">
                  {f.title}
                  {f.soon && <span className="ml-2 align-middle text-[12px] font-semibold text-signal">준비 중</span>}
                </p>
                <p className="mt-1 text-[14px] text-mute">{f.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-3 px-5 pt-12 pb-[max(32px,env(safe-area-inset-bottom))]">
        <Link href={begin} className="btn w-full">
          무료로 내 KNIL 만들기
        </Link>
        <button onClick={demo} className="btn-ghost w-full">
          예시 계정으로 편집 화면 둘러보기
        </button>
        {!LIVE && <p className="pt-2 text-center text-[12px] text-mute">미리보기 버전이에요. 만든 페이지는 이 기기에만 저장돼요.</p>}
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
      className="mt-8"
    >
      <div className="flex h-14 items-center border border-ink bg-white px-4 focus-within:ring-2 focus-within:ring-ink/10">
        <span className="shrink-0 text-mute">knil.com/@</span>
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
      <p className={`mt-1.5 h-5 text-[13px] ${problem ? "text-signal" : "text-mute"}`}>
        {handle && (checking ? "확인하는 중…" : (problem ?? "사용할 수 있는 주소예요"))}
      </p>
      <button className="btn mt-2 w-full" disabled={!ok}>
        바로 만들기
      </button>
    </form>
  );
}
