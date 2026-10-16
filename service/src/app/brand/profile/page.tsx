"use client";

import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Field } from "@/components/Sheet";
import { PageTitle } from "@/components/ui";
import { BRAND_KINDS, emptyBrand, getBrand, saveBrand, type BrandProfile } from "@/lib/brand";

export default function BrandProfilePage() {
  return <AppShell>{() => <Profile />}</AppShell>;
}

function Profile() {
  const [b, setB] = useState<BrandProfile>(emptyBrand);
  const [saved, setSaved] = useState(false);
  useEffect(() => setB(getBrand()), []);
  const set = <K extends keyof BrandProfile>(k: K, v: BrandProfile[K]) => (setB({ ...b, [k]: v }), setSaved(false));

  return (
    <main className="px-5 pb-12">
      <PageTitle icon={Building2} sub="크리에이터에게 제안을 보낼 때 함께 전해지는 정보예요.">
        브랜드 프로필
      </PageTitle>

      <div className="rounded-[24px] bg-ink p-5 text-white">
        <span className="rounded-full bg-signal px-2.5 py-1 text-[11px] font-bold">{b.kind}</span>
        <p className="mt-3 text-[22px] font-extrabold">{b.name || "브랜드 이름"}</p>
        <p className="mt-1 text-[14px] text-white/60">{b.intro || "한 줄 소개가 여기에 보여요"}</p>
      </div>

      <div className="mt-5">
        <span className="text-[13px] font-semibold text-ink/70">계정 종류</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {BRAND_KINDS.map((k) => (
            <button key={k} onClick={() => set("kind", k)} className={`rounded-full px-3.5 py-1.5 text-[14px] font-semibold ${b.kind === k ? "bg-signal text-white" : "bg-surface"}`}>
              {k}
            </button>
          ))}
        </div>
      </div>
      <Field label="브랜드 · 회사 · 병원 이름" value={b.name} onChange={(v) => set("name", v)} placeholder="KNIL 코스메틱" />
      <Field label="한 줄 소개" value={b.intro} onChange={(v) => set("intro", v)} placeholder="민감 피부를 위한 클린 스킨케어" multiline />
      <Field label="담당자 연락처" value={b.contact} onChange={(v) => set("contact", v)} placeholder="이메일 또는 전화번호" />
      <Field label="홈페이지" type="url" value={b.site} onChange={(v) => set("site", v)} placeholder="https://" />

      <button
        onClick={() => {
          saveBrand(b);
          setSaved(true);
        }}
        className="btn-accent mt-8 w-full"
      >
        {saved ? "저장했어요" : "저장하기"}
      </button>
      <p className="mt-3 text-center text-[12px] text-mute">지금은 이 기기에만 저장돼요. 브랜드 계정이 정식으로 열리면 서버로 옮겨요.</p>
    </main>
  );
}
