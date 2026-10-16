"use client";

import { AppShell } from "@/components/AppShell";
import { PageTitle, SectionHead, Soon } from "@/components/ui";

const PLANS = [
  {
    name: "무료",
    price: "0원",
    current: true,
    items: ["프로필 링크와 모든 블록", "방문, 클릭, 유입 경로 통계", "브랜드 제안함", "협업 프로필"],
  },
  {
    name: "프로",
    price: "준비 중",
    items: ["자동 DM · 댓글", "콘텐츠별 반응 분석", "내 페이지 디자인 꾸미기", "KNIL 표시 숨기기"],
  },
];

export default function MembershipPage() {
  return (
    <AppShell>
      {() => (
        <main className="px-5 pb-12">
          <PageTitle sub="지금은 모든 기본 기능을 무료로 쓸 수 있어요.">멤버십</PageTitle>

          <div className="space-y-3">
            {PLANS.map((p) => (
              <section key={p.name} className={`border p-5 ${p.current ? "border-ink bg-white" : "border-rule"}`}>
                <div className="flex items-baseline justify-between">
                  <h2 className="text-[20px] font-bold">{p.name}</h2>
                  {p.current ? <span className="text-[13px] font-semibold">이용 중</span> : <Soon />}
                </div>
                <p className="mt-1 text-[15px] text-mute">{p.price}</p>
                <ul className="mt-4 space-y-1.5 text-[15px]">
                  {p.items.map((i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-signal">·</span>
                      {i}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <SectionHead title="결제 수단" />
          <p className="border-y border-rule py-4 text-[14px] text-mute">등록된 결제 수단이 없어요. 유료 플랜이 열리면 등록할 수 있어요.</p>

          <SectionHead title="결제 내역" />
          <p className="border-y border-rule py-4 text-[14px] text-mute">결제 내역이 없어요.</p>
        </main>
      )}
    </AppShell>
  );
}
