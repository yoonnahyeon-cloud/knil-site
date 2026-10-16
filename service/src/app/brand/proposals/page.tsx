"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Send } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Avatar } from "@/components/CreatorPage";
import { Chips, Empty, PageTitle } from "@/components/ui";
import { SENT_STATUS, sentProposals, setSentStatus, type SentStatus } from "@/lib/brand";
import { useStore } from "@/lib/store";

export default function ProposalsPage() {
  return <AppShell>{() => <Proposals />}</AppShell>;
}

function Proposals() {
  const list = useStore(async () => sentProposals());
  const [filter, setFilter] = useState<"all" | SentStatus>("all");
  const [open, setOpen] = useState<string | null>(null);
  const shown = list?.filter((s) => filter === "all" || s.status === filter) ?? [];
  const count = (k: "all" | SentStatus) => list?.filter((s) => k === "all" || s.status === k).length ?? 0;
  const options = [{ key: "all" as const, label: "전체" }, ...SENT_STATUS];

  return (
    <main className="px-5 pb-12">
      <PageTitle icon={Send} sub="크리에이터에게 보낸 협업 제안과 진행 상태예요. 크리에이터가 남겨주신 연락처로 답해요.">
        보낸 제안
      </PageTitle>
      <Chips value={filter} options={options} onChange={setFilter} label={(k) => `${options.find((o) => o.key === k)!.label} ${count(k)}`} />

      <div className="mt-4 space-y-2">
        {list && shown.length === 0 && (
          <Empty icon={Send} title="아직 보낸 제안이 없어요" body="크리에이터를 찾아 마음에 들면 바로 제안해 보세요.">
            <Link href="/brand/creators" className="btn-accent gap-1.5 px-6">
              <Search size={16} /> 크리에이터 찾기
            </Link>
          </Empty>
        )}
        {shown.map((s) => (
          <div key={s.id} className="rounded-[22px] bg-white p-4 ring-1 ring-rule">
            <button onClick={() => setOpen(open === s.id ? null : s.id)} className="flex w-full items-center gap-3 text-left">
              <Avatar name={s.name} size={44} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-extrabold">{s.name}</span>
                <span className="block truncate text-[13px] text-mute">{s.message}</span>
              </span>
              <span className="shrink-0 text-right">
                <span className={`block rounded-full px-2.5 py-1 text-[11px] font-bold ${s.status === "agreed" ? "bg-signal text-white" : s.status === "closed" ? "bg-surface text-mute" : "bg-soft text-signal"}`}>
                  {SENT_STATUS.find((x) => x.key === s.status)!.label}
                </span>
                <span className="mt-1 block text-[11px] text-mute">{new Date(s.at).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })}</span>
              </span>
            </button>
            {open === s.id && (
              <div className="mt-3 border-t border-rule pt-3">
                <p className="whitespace-pre-wrap text-[14px]">{s.message}</p>
                {s.budget && <p className="mt-2 text-[13px] text-mute">예산 {s.budget}</p>}
                <div className="mt-3 grid grid-cols-4 gap-1.5">
                  {SENT_STATUS.map((x) => (
                    <button key={x.key} onClick={() => setSentStatus(s.id, x.key)} className={`h-9 rounded-full text-[12px] font-bold ${s.status === x.key ? "bg-ink text-white" : "bg-surface"}`}>
                      {x.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
