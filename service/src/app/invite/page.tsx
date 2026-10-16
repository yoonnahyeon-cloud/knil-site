"use client";

import { useState } from "react";
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
      <PageTitle sub="크리에이터 친구에게 KNIL을 소개해 주세요.">친구 초대</PageTitle>

      <div className="bg-ink px-5 py-6 text-paper">
        <p className="text-[13px] opacity-60">내 초대 링크</p>
        <p className="mt-1 break-all text-[15px] font-semibold">{link}</p>
        <button onClick={share} className="mt-5 h-12 w-full bg-paper font-semibold text-ink">
          {copied ? "링크를 복사했어요" : "초대 링크 보내기"}
        </button>
      </div>

      <SectionHead title="이렇게 진행돼요" />
      <ol className="border-t border-ink">
        {["초대 링크를 친구에게 보내요", "친구가 링크로 KNIL에 가입해요", "친구와 나 모두 혜택을 받아요"].map((t, i) => (
          <li key={t} className="flex gap-4 border-b border-rule py-4">
            <span className="font-display text-[15px] font-bold text-mute">{String(i + 1).padStart(2, "0")}</span>
            <span className="font-semibold">{t}</span>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex items-center justify-between bg-white px-4 py-4">
        <span>
          <span className="block font-semibold">초대 혜택</span>
          <span className="text-[13px] text-mute">유료 플랜이 열리면 초대한 만큼 무료 이용 기간을 드려요</span>
        </span>
        <Soon className="shrink-0" />
      </div>
    </main>
  );
}
