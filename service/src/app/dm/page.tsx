"use client";

import { AppShell } from "@/components/AppShell";

const STEPS = [
  ["키워드", "게시물이나 릴스에 댓글 키워드를 정해요. 예: 정보"],
  ["자동 답장", "그 키워드로 댓글을 단 팔로워에게 DM과 링크가 자동으로 가요."],
  ["반응 확인", "콘텐츠별 댓글, 발송, 링크 클릭을 통계에서 같이 봐요."],
];

export default function DmPage() {
  return (
    <AppShell>
      {() => (
        <main className="px-5 pb-10">
          <p className="pt-6 text-[13px] font-semibold text-signal">준비 중</p>
          <h1 className="mt-1 text-[26px] font-bold leading-snug tracking-[-0.04em]">
            댓글 하나에,
            <br />
            링크가 도착합니다.
          </h1>
          <ol className="mt-8 border-t border-ink">
            {STEPS.map(([k, v], i) => (
              <li key={k} className="flex gap-4 border-b border-rule py-4">
                <span className="font-display text-[15px] font-bold text-mute">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <p className="font-semibold">{k}</p>
                  <p className="text-[14px] text-mute">{v}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-[13px] leading-relaxed text-mute">
            Instagram 프로페셔널 계정을 연결해 Meta 공식 API로 동작합니다. Meta 앱 검수를 마친 뒤 열립니다.
          </p>
        </main>
      )}
    </AppShell>
  );
}
