"use client";

import { useEffect, useState } from "react";
import { BASE } from "@/lib/base";
import { AppShell } from "@/components/AppShell";
import { Avatar } from "@/components/CreatorPage";
import { Field } from "@/components/Sheet";
import { Chips, Empty, PageTitle, SectionHead } from "@/components/ui";
import { proposals, savePortfolio, setProposalStatus, useStore } from "@/lib/store";
import { CATEGORIES, type Page, type Portfolio, type Proposal, type ProposalStatus } from "@/lib/types";

type Tab = "campaigns" | "inbox" | "portfolio";
const TABS: { key: Tab; label: string }[] = [
  { key: "campaigns", label: "캠페인" },
  { key: "inbox", label: "제안함" },
  { key: "portfolio", label: "협업 프로필" },
];

export default function CollabPage() {
  return <AppShell>{(page) => <Collab page={page} />}</AppShell>;
}

function Collab({ page }: { page: Page }) {
  const [tab, setTab] = useState<Tab>("campaigns");

  useEffect(() => {
    const t = new URLSearchParams(location.search).get("tab") as Tab | null;
    if (t && TABS.some((x) => x.key === t)) setTab(t);
  }, []);

  const go = (t: Tab) => {
    setTab(t);
    history.replaceState(null, "", `?tab=${t}`);
  };

  return (
    <main className="pb-12">
      <div className="sticky top-14 z-20 grid grid-cols-3 border-b border-rule bg-paper">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => go(t.key)} className={`h-11 text-[14px] ${tab === t.key ? "border-b-2 border-ink font-bold" : "text-mute"}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="px-5">
        {tab === "campaigns" && <Campaigns onPortfolio={() => go("portfolio")} />}
        {tab === "inbox" && <Inbox handle={page.profile.handle} />}
        {tab === "portfolio" && <PortfolioForm page={page} />}
      </div>
    </main>
  );
}

function Campaigns({ onPortfolio }: { onPortfolio: () => void }) {
  const [notify, setNotify] = useState(false);
  useEffect(() => {
    try {
      setNotify(localStorage.getItem("knil:notify-campaigns") === "1");
    } catch {}
  }, []);
  const toggle = () => {
    const next = !notify;
    setNotify(next);
    try {
      localStorage.setItem("knil:notify-campaigns", next ? "1" : "0");
    } catch {}
  };

  return (
    <>
      <PageTitle sub="브랜드가 여는 협업 캠페인에 지원하고 리워드를 받아요.">브랜드 캠페인</PageTitle>
      <div className="grid grid-cols-3 border-y border-ink py-4 text-center">
        {[
          ["지원", 0],
          ["선정", 0],
          ["제출 필요", 0],
        ].map(([k, v]) => (
          <div key={k} className="border-r border-rule last:border-0">
            <p className="text-[13px] text-mute">{k}</p>
            <p className="text-[20px] font-bold">{v}건</p>
          </div>
        ))}
      </div>

      <button onClick={toggle} className="mt-4 flex w-full items-center justify-between bg-white px-4 py-3.5 text-left">
        <span>
          <span className="block font-semibold">새 캠페인 알림</span>
          <span className="text-[13px] text-mute">캠페인이 열리면 먼저 알려드려요</span>
        </span>
        <span className={`relative h-7 w-12 rounded-full transition-colors ${notify ? "bg-ink" : "bg-rule"}`}>
          <span className={`absolute top-1 size-5 rounded-full bg-white transition-all ${notify ? "left-6" : "left-1"}`} />
        </span>
      </button>

      <SectionHead title="모집 중인 캠페인" />
      <Empty title="아직 모집 중인 캠페인이 없어요" body="협업 프로필을 채워 두면 나와 맞는 캠페인을 먼저 추천해 드려요.">
        <button onClick={onPortfolio} className="btn-ghost px-6">
          협업 프로필 채우기
        </button>
      </Empty>
    </>
  );
}

const STATUS: { key: "all" | ProposalStatus; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "new", label: "새 제안" },
  { key: "progress", label: "진행 중" },
  { key: "done", label: "완료" },
];

function Inbox({ handle }: { handle: string }) {
  const list = useStore(() => proposals(handle), [handle]);
  const [filter, setFilter] = useState<"all" | ProposalStatus>("all");
  const [open, setOpen] = useState<string | null>(null);
  const shown = list?.filter((p) => filter === "all" || p.status === filter) ?? [];
  const count = (k: "all" | ProposalStatus) => list?.filter((p) => k === "all" || p.status === k).length ?? 0;

  return (
    <>
      <PageTitle sub="브랜드가 내 페이지의 ‘협업 제안하기’로 보낸 제안이에요.">제안함</PageTitle>
      <Chips value={filter} options={STATUS} onChange={setFilter} label={(k) => `${STATUS.find((s) => s.key === k)!.label} ${count(k)}`} />

      <div className="mt-4">
        {!list && <p className="py-10 text-center text-mute">불러오는 중…</p>}
        {list && shown.length === 0 && (
          <Empty title="아직 받은 제안이 없어요" body="내 페이지 맨 위의 ‘협업 제안하기’ 버튼으로 브랜드가 바로 제안을 보낼 수 있어요.">
            <a href={`${BASE}/@${handle}`} target="_blank" rel="noopener" className="btn-ghost px-6">
              내 페이지에서 확인
            </a>
          </Empty>
        )}
        {shown.map((p) => (
          <ProposalItem key={p.id} p={p} open={open === p.id} onToggle={() => setOpen(open === p.id ? null : p.id)} />
        ))}
      </div>
    </>
  );
}

function ProposalItem({ p, open, onToggle }: { p: Proposal; open: boolean; onToggle: () => void }) {
  const isEmail = p.contact.includes("@");
  const set = (s: ProposalStatus) => setProposalStatus(p.handle, p.id, s);
  return (
    <div className="border-b border-rule">
      <button onClick={onToggle} className="flex w-full items-start gap-3 py-4 text-left">
        {p.status === "new" && <span className="mt-2 size-1.5 shrink-0 rounded-full bg-signal" />}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[16px] font-semibold">{p.brand}</p>
          <p className="truncate text-[14px] text-mute">{p.message}</p>
        </div>
        <span className="shrink-0 text-[12px] text-mute">{new Date(p.at).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })}</span>
      </button>
      {open && (
        <div className="pb-5">
          <p className="whitespace-pre-wrap bg-white p-4 text-[15px]">{p.message}</p>
          <dl className="mt-3 space-y-1 text-[14px]">
            {p.budget && (
              <div className="flex gap-3">
                <dt className="w-12 text-mute">예산</dt>
                <dd>{p.budget}</dd>
              </div>
            )}
            <div className="flex gap-3">
              <dt className="w-12 text-mute">연락처</dt>
              <dd>
                <a href={isEmail ? `mailto:${p.contact}` : `tel:${p.contact}`} className="font-semibold underline">
                  {p.contact}
                </a>
              </dd>
            </div>
          </dl>
          <div className="mt-4 grid grid-cols-3 gap-2 text-[14px]">
            {STATUS.slice(1).map((s) => (
              <button key={s.key} onClick={() => set(s.key as ProposalStatus)} className={`h-10 border ${p.status === s.key ? "border-ink bg-ink text-paper" : "border-rule"}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const EMPTY: Portfolio = { intro: "", categories: [], tags: [], region: "", audience: "", collabs: "" };

function PortfolioForm({ page }: { page: Page }) {
  const [f, setF] = useState<Portfolio>({ ...EMPTY, ...page.portfolio });
  const [tags, setTags] = useState((page.portfolio?.tags ?? []).join(", "));
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const set = <K extends keyof Portfolio>(k: K, v: Portfolio[K]) => (setF({ ...f, [k]: v }), setState("idle"));

  const toggleCat = (c: string) =>
    set("categories", f.categories.includes(c) ? f.categories.filter((x) => x !== c) : f.categories.length < 3 ? [...f.categories, c] : f.categories);

  const save = async () => {
    setState("saving");
    const clean = tags
      .split(/[,\s]+/)
      .map((t) => t.replace(/^#/, "").trim())
      .filter(Boolean)
      .slice(0, 10);
    try {
      await savePortfolio(page, { ...f, tags: clean });
      setState("saved");
    } catch {
      setState("error");
    }
  };

  return (
    <>
      <PageTitle sub="브랜드가 크리에이터를 고를 때 보는 정보예요. 채울수록 나와 맞는 협업이 들어와요.">협업 프로필</PageTitle>

      <div className="bg-white p-4">
        <div className="flex items-center gap-3">
          <Avatar name={page.profile.name} src={page.profile.avatar} size={44} />
          <div className="min-w-0">
            <p className="truncate font-bold">{page.profile.name}</p>
            <p className="truncate text-[13px] text-mute">{[...f.categories, f.region, f.audience].filter(Boolean).join(" · ") || "카테고리, 지역, 주 시청층"}</p>
          </div>
        </div>
        <p className="mt-3 text-[14px]">{f.intro || <span className="text-mute">한 줄 소개가 여기에 보여요</span>}</p>
        {tags && (
          <p className="mt-2 text-[13px] font-semibold text-signal">
            {tags
              .split(/[,\s]+/)
              .filter(Boolean)
              .map((t) => `#${t.replace(/^#/, "")}`)
              .join(" ")}
          </p>
        )}
      </div>

      <Field label="소개" value={f.intro} onChange={(v) => set("intro", v)} placeholder="협찬 릴스를 꾸준히 찍는 뷰티 크리에이터예요" multiline />

      <div className="mt-5">
        <span className="text-[13px] text-mute">카테고리 (최대 3개)</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => toggleCat(c)} className={`border px-3 py-1.5 text-[14px] ${f.categories.includes(c) ? "border-ink bg-ink text-paper" : "border-rule"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <Field label="콘텐츠 태그" value={tags} onChange={(v) => (setTags(v), setState("idle"))} placeholder="데일리룩, 가을코디, 협찬릴스" />
      <Field label="활동 지역" value={f.region} onChange={(v) => set("region", v)} placeholder="서울" />
      <Field label="주 시청층" value={f.audience} onChange={(v) => set("audience", v)} placeholder="20대 후반 여성" />
      <Field label="광고 · 협찬 경험" value={f.collabs} onChange={(v) => set("collabs", v)} placeholder="스킨케어 A사 릴스 3회, 패션 B사 공동구매" multiline />

      <button onClick={save} disabled={state === "saving"} className="btn mt-8 w-full">
        {state === "saving" ? "저장하는 중…" : state === "saved" ? "저장했어요" : "저장하기"}
      </button>
      {state === "error" && <p className="mt-2 text-center text-[13px] text-signal">저장하지 못했어요. 잠시 후 다시 시도해 주세요.</p>}
    </>
  );
}
