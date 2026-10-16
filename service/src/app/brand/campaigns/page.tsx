"use client";

import { useState } from "react";
import { CalendarDays, Gift, Megaphone, Plus, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Field, Sheet } from "@/components/Sheet";
import { Empty, IconTile, PageTitle } from "@/components/ui";
import { campaigns, deleteCampaign, saveCampaign, type Campaign } from "@/lib/brand";
import { useStore } from "@/lib/store";
import { CATEGORIES } from "@/lib/types";

export default function CampaignsPage() {
  return <AppShell>{() => <Campaigns />}</AppShell>;
}

type Draft = Omit<Campaign, "id" | "at"> & { id?: string };
const EMPTY: Draft = { title: "", category: "뷰티", reward: "", slots: "", deadline: "", body: "" };

function Campaigns() {
  const list = useStore(async () => campaigns());
  const [draft, setDraft] = useState<Draft | null>(null);

  return (
    <main className="px-5 pb-12">
      <PageTitle icon={Megaphone} sub="모집 조건과 리워드를 정해 두면 크리에이터에게 한 번에 알릴 수 있어요.">
        캠페인
      </PageTitle>

      <div className="mb-4 flex items-center gap-2 rounded-2xl bg-soft px-4 py-3 text-[13px]">
        <span className="rounded-full bg-signal px-2 py-0.5 text-[11px] font-bold text-white">준비 중</span>
        크리에이터 쪽 공개 모집은 곧 열려요. 지금은 초안으로 저장돼요.
      </div>

      <button onClick={() => setDraft(EMPTY)} className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-signal/40 bg-soft/50 font-bold text-signal">
        <Plus size={20} strokeWidth={2.6} /> 새 캠페인
      </button>

      <div className="mt-4 space-y-3">
        {list?.length === 0 && <Empty icon={Megaphone} title="아직 만든 캠페인이 없어요" body="제품 체험, 방문 후기, 릴스 제작 등 원하는 협업을 적어 보세요." />}
        {list?.map((c) => (
          <button key={c.id} onClick={() => setDraft(c)} className="block w-full rounded-[22px] bg-white p-4 text-left ring-1 ring-rule">
            <div className="flex items-start gap-3">
              <IconTile icon={Megaphone} tone="pink" size={42} />
              <div className="min-w-0 flex-1">
                <span className="rounded-full bg-ink px-2 py-0.5 text-[11px] font-bold text-white">{c.category}</span>
                <p className="mt-1.5 text-[16px] font-extrabold leading-snug">{c.title}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-[12px]">
              <Meta icon={Gift} label="리워드" value={c.reward || "–"} />
              <Meta icon={Users} label="모집" value={c.slots ? `${c.slots}명` : "–"} />
              <Meta icon={CalendarDays} label="마감" value={c.deadline || "–"} />
            </div>
          </button>
        ))}
      </div>

      {draft && (
        <Sheet
          title={draft.id ? "캠페인 수정" : "새 캠페인"}
          onClose={() => setDraft(null)}
          onSave={() => {
            if (!draft.title.trim()) return;
            saveCampaign(draft);
            setDraft(null);
          }}
        >
          <Field label="캠페인 이름" value={draft.title} onChange={(title) => setDraft({ ...draft, title })} placeholder="가을 신제품 립 체험 릴스" />
          <div className="mt-4">
            <span className="text-[13px] font-semibold text-ink/70">카테고리</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button key={c} onClick={() => setDraft({ ...draft, category: c })} className={`rounded-full px-3.5 py-1.5 text-[14px] font-semibold ${draft.category === c ? "bg-signal text-white" : "bg-surface"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <Field label="리워드" value={draft.reward} onChange={(reward) => setDraft({ ...draft, reward })} placeholder="제품 제공 + 30만원" />
          <Field label="모집 인원" value={draft.slots} onChange={(slots) => setDraft({ ...draft, slots: slots.replace(/\D/g, "") })} placeholder="5" />
          <Field label="마감일" type="date" value={draft.deadline} onChange={(deadline) => setDraft({ ...draft, deadline })} />
          <Field label="내용" value={draft.body} onChange={(body) => setDraft({ ...draft, body })} placeholder="원하는 콘텐츠, 업로드 기간, 필수 해시태그 등" multiline />
          {draft.id && (
            <button
              onClick={() => {
                deleteCampaign(draft.id!);
                setDraft(null);
              }}
              className="mt-10 w-full rounded-full bg-[#fff0f0] py-3 text-[14px] font-bold text-danger"
            >
              이 캠페인 삭제
            </button>
          )}
        </Sheet>
      )}
    </main>
  );
}

function Meta({ icon: Icon, label, value }: { icon: typeof Gift; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface p-2">
      <p className="flex items-center gap-1 text-mute">
        <Icon size={12} /> {label}
      </p>
      <p className="mt-0.5 truncate font-bold">{value}</p>
    </div>
  );
}
