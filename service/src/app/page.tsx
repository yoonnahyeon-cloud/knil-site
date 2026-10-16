"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LIVE, getSession, tryDemo } from "@/lib/store";

export default function Home() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  // Signed in already (or just back from the login email): go straight on.
  useEffect(() => {
    getSession().then((s) => {
      if (s?.handle) router.replace("/edit");
      else if (s) router.replace("/start");
      else setChecked(true);
    });
  }, [router]);

  const demo = () => {
    tryDemo();
    router.push("/edit");
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col px-6 pt-[max(24px,env(safe-area-inset-top))] pb-[max(24px,env(safe-area-inset-bottom))]">
      <p className="font-display text-[22px] font-bold tracking-tight">knil</p>

      <div className="flex flex-1 flex-col justify-center">
        <h1 className="text-[34px] font-bold leading-[1.25] tracking-[-0.04em]">
          크리에이터의
          <br />
          모든 활동을
          <br />
          하나의 KNIL로.
        </h1>
        <p className="mt-5 text-[16px] text-mute">
          흩어진 채널, 영상, 상품, 협업을 링크 하나에 모으고
          <br />
          누가 무엇에 반응했는지 확인하세요.
        </p>
      </div>

      <div className={`space-y-3 transition-opacity ${checked ? "" : "opacity-0"}`}>
        <Link href={LIVE ? "/login" : "/start"} className="btn w-full">
          {LIVE ? "시작하기" : "내 KNIL 만들기"}
        </Link>
        <button onClick={demo} className="btn-ghost w-full">
          예시 계정으로 둘러보기
        </button>
        {!LIVE && <p className="pt-2 text-center text-[12px] text-mute">미리보기 버전이에요. 만든 페이지는 이 기기에만 저장돼요.</p>}
      </div>
    </main>
  );
}
