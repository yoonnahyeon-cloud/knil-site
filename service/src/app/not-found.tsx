"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CreatorPage } from "@/components/CreatorPage";
import { BASE } from "@/lib/base";
import { getPage, record } from "@/lib/store";
import type { Page } from "@/lib/types";

// Creator pages live at /@handle. A static host cannot know every handle in
// advance, so it serves this page for any unknown path and the handle is
// read from the address bar here.
export default function NotFound() {
  const [state, setState] = useState<{ page: Page | null; handle: string | null }>();
  const counted = useRef(false);

  useEffect(() => {
    const path = decodeURIComponent(location.pathname).slice(BASE.length);
    const handle = path.match(/^\/@([a-z0-9._]+)\/?$/)?.[1] ?? null;
    const page = handle ? getPage(handle) : null;
    setState({ page, handle });
    if (page) {
      document.title = `${page.profile.name} | KNIL`;
      if (!counted.current) {
        counted.current = true;
        record({ kind: "view", handle: page.profile.handle });
      }
    }
  }, []);

  if (!state) return null;
  if (state.page) return <CreatorPage page={state.page} />;

  return (
    <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col justify-center px-6">
      <p className="font-display text-[56px] font-extrabold leading-none tracking-tight">knil</p>
      <p className="mt-6 text-[18px] font-semibold">
        {state.handle ? `@${state.handle} 페이지를 찾을 수 없어요.` : "페이지를 찾을 수 없어요."}
      </p>
      <p className="mt-1 text-mute">{state.handle ? "아직 아무도 쓰지 않는 아이디예요." : "주소를 다시 확인해 주세요."}</p>
      <Link href={state.handle ? `/start?h=${state.handle}` : "/start"} className="btn mt-10">
        {state.handle ? `@${state.handle}로 내 KNIL 만들기` : "내 KNIL 만들기"}
      </Link>
    </main>
  );
}
