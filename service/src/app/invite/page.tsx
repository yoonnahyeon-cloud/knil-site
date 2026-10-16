"use client";

import { useState } from "react";
import { Gift, Link2, Send, UserPlus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageTitle, SectionHead, Soon } from "@/components/ui";
import { BASE } from "@/lib/base";

export default function InvitePage() {
  return <AppShell>{(page) => <Invite handle={page.profile.handle} />}</AppShell>;
}

function Invite({ handle }: { handle: string }) {
  const [copied, setCopied] = useState(false);
  const link = typeof window === "undefined" ? "" : `${location.origin}${BASE}/?ref=${handle}`;

  const share = async () => {
    const text = "KNIL로 내 채널과 상품, 협업을 링크 하나에 모아 보세요.";
    try {
      if (navigator.share) await navigator.share({ title: "KNIL", text, url: link });
      else {
        await navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }
    } catch {}
  };

  return (
    <main className="px-5 pb-12">
      <PageTitle icon={Gift} sub="크리에이터 친구에게 KNIL을 소개해 주세요.">친구 초대</PageTitle>

      <div className="rounded-[28px] bg-[radial-gradient(130%_120%_at_100%_0%,#ff8cc6_0%,#7c4dff_45%,#1d1530_100%)] px-5 py-6 text-white">
        <p className="text-[22px] font-extrabold leading-tight tracking-tight">
          친구도 나도
          <br />
          함께 받는 혜택
        </p>
        <p className="mt-4 text-[12px] opacity-70">내 초대 링크</p>
        <p className="mt-0.5 break-all rounded-2xl bg-white/15 px-3 py-2.5 text-[14px] font-semibold backdrop-blur">{link}</p>
        <button onClick={share} className="mt-4 flex h-12 w-full items-center justify-center gap-1.5 rounded-full bg-white font-bold text-ink">
          <Send size={17} />
          {copied ? "링크를 복사했어요" : "초대 링크 보내기"}
        </button>
      </div>

      <SectionHead title="이렇게 진행돼요" />
      <ol className="grid grid-cols-3 gap-2">
        {[
          { t: "초대 링크를 친구에게 보내요", icon: Link2 },
          { t: "친구가 링크로 KNIL에 가입해요", icon: UserPlus },
          { t: "친구와 나 모두 혜택을 받아요", icon: Gift },
        ].map((x, i) => (
          <li key={x.t} className="rounded-[20px] bg-surface p-3">
            <span className="grid size-9 place-items-center rounded-xl bg-white text-signal">
              <x.icon size={18} />
            </span>
            <p className="mt-2 text-[11px] font-extrabold text-signal">STEP {i + 1}</p>
            <p className="text-[13px] font-semibold leading-snug">{x.t}</p>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex items-center justify-between rounded-2xl bg-surface px-4 py-4">
        <span>
          <span className="block font-semibold">초대 혜택</span>
          <span className="text-[13px] text-mute">유료 플랜이 열리면 초대한 만큼 무료 이용 기간을 드려요</span>
        </span>
        <Soon className="shrink-0" />
      </div>
    </main>
  );
}
