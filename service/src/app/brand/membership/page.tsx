"use client";

import { Check, Crown, Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Avatar } from "@/components/CreatorPage";
import { PageTitle, SectionHead, Soon } from "@/components/ui";
import { BRAND_ACCOUNTS, getBrand } from "@/lib/brand";
import { getPage, useStore } from "@/lib/store";

// Brand plans. More than one brand account needs a paid plan; prices are
// placeholders until billing opens.
const BRAND_PLAN = { name: "프로", accounts: 3, trial: true };

const PLANS = [
  {
    key: "free",
    name: "스타터",
    price: "무료",
    accounts: "브랜드 계정 1개",
    items: ["브랜드 페이지 · 예약 블록", "크리에이터 찾기 · 제안 월 10건", "AI 해외 고객 상담 월 100건"],
  },
  {
    key: "pro",
    name: "프로",
    price: "월 99,000원",
    accounts: "브랜드 계정 3개까지",
    items: ["크리에이터 제안 무제한", "캠페인 모집", "AI 해외 고객 상담 월 1,000건", "KNIL 표시 숨기기"],
  },
  {
    key: "biz",
    name: "비즈니스",
    price: "도입 문의",
    accounts: "브랜드 계정 10개 이상",
    items: ["에이전시 · 여러 브랜드 운영", "팀원 초대와 권한 관리", "전담 매니저"],
  },
];

export default function BrandMembershipPage() {
  return <AppShell>{() => <Membership />}</AppShell>;
}

function Membership() {
  const list = useStore(() => Promise.all(BRAND_ACCOUNTS.map(async (a) => ({ handle: a.handle, page: await getPage(a.handle), brand: getBrand(a.handle) }))));
  const used = BRAND_ACCOUNTS.length;

  return (
    <main className="px-5 pb-12">
      <PageTitle icon={Crown} sub="브랜드 계정을 2개 이상 운영하려면 유료 플랜이 필요해요.">
        멤버십
      </PageTitle>

      <section className="rounded-[24px] bg-white p-5 ring-1 ring-rule">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold text-mute">이용 중인 플랜</span>
          {BRAND_PLAN.trial && <span className="rounded-full bg-surface px-2.5 py-1 text-[11px] font-bold">체험 중</span>}
        </div>
        <p className="mt-1 text-[24px] font-extrabold tracking-tight">{BRAND_PLAN.name}</p>

        <div className="mt-4 flex items-baseline justify-between text-[13px]">
          <span className="font-semibold">브랜드 계정</span>
          <span className="font-bold">
            {used} <span className="text-mute">/ {BRAND_PLAN.accounts}</span>
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface">
          <div className="h-full rounded-full bg-ink" style={{ width: `${(used / BRAND_PLAN.accounts) * 100}%` }} />
        </div>
        <div className="mt-4 space-y-1">
          {list?.map((a) => (
            <div key={a.handle} className="flex items-center gap-3 py-1.5">
              <Avatar name={a.brand.name} src={a.page?.profile.avatar} size={32} />
              <span className="min-w-0 flex-1 truncate text-[14px] font-bold">{a.brand.name}</span>
              <span className="text-[12px] text-mute">{a.brand.kind}</span>
            </div>
          ))}
          <div className="flex items-center gap-3 py-1.5 text-mute">
            <span className="grid size-8 place-items-center rounded-full bg-surface">
              <Plus size={15} />
            </span>
            <span className="flex-1 text-[14px]">계정 추가</span>
            <span className="text-[12px]">1개 남음</span>
          </div>
        </div>
      </section>

      <SectionHead title="플랜" />
      <div className="space-y-2.5">
        {PLANS.map((p) => {
          const current = p.name === BRAND_PLAN.name;
          return (
            <section key={p.key} className={`rounded-[22px] p-5 ${current ? "bg-white ring-2 ring-ink" : "bg-surface"}`}>
              <div className="flex items-center justify-between">
                <h2 className="text-[18px] font-extrabold">{p.name}</h2>
                {current ? <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-bold text-white">이용 중</span> : p.key !== "free" && <Soon />}
              </div>
              <p className="mt-0.5 text-[15px] font-bold">{p.price}</p>
              <p className="mt-3 inline-block rounded-full bg-lilac px-2.5 py-1 text-[12px] font-bold">{p.accounts}</p>
              <ul className="mt-3 space-y-1.5 text-[14px]">
                {p.items.map((i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check size={14} strokeWidth={2.6} className="shrink-0 text-mute" />
                    {i}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-3 rounded-[22px] bg-white p-4 ring-1 ring-rule">
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-mist">
          <Plus size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-bold">브랜드 계정 추가</span>
          <span className="block text-[12px] text-mute">플랜 한도를 넘으면 1개당 월 29,000원</span>
        </span>
        <Soon />
      </div>

      <SectionHead title="결제 수단" />
      <p className="rounded-[18px] bg-surface p-4 text-[14px] text-mute">등록된 결제 수단이 없어요. 유료 플랜이 열리면 등록할 수 있어요.</p>
      <SectionHead title="결제 내역" />
      <p className="rounded-[18px] bg-surface p-4 text-[14px] text-mute">결제 내역이 없어요.</p>
    </main>
  );
}
