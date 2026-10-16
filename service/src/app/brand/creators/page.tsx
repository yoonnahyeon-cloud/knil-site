"use client";

import { useMemo, useState } from "react";
import { Heart, Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CreatorCard, CreatorSheet } from "@/components/CreatorCard";
import { Chips, Empty, PageTitle } from "@/components/ui";
import { listCreators, savedCreators, type Creator } from "@/lib/brand";
import { useStore } from "@/lib/store";
import { CATEGORIES } from "@/lib/types";

export default function CreatorsPage() {
  return <AppShell>{() => <Creators />}</AppShell>;
}

type Sort = "followers" | "recent";

function Creators() {
  const all = useStore(listCreators);
  const saved = useStore(async () => savedCreators()) ?? [];
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("전체");
  const [sort, setSort] = useState<Sort>("followers");
  const [onlySaved, setOnlySaved] = useState(false);
  const [open, setOpen] = useState<Creator | null>(null);

  const list = useMemo(() => {
    const words = q.trim().toLowerCase();
    const out = (all ?? []).filter((c) => {
      const p = c.page.portfolio;
      if (cat !== "전체" && !p?.categories.includes(cat)) return false;
      if (onlySaved && !saved.includes(c.page.profile.handle)) return false;
      if (!words) return true;
      const hay = [c.page.profile.name, c.page.profile.handle, c.page.profile.bio, p?.intro, p?.region, p?.audience, ...(p?.tags ?? [])].join(" ").toLowerCase();
      return hay.includes(words);
    });
    return sort === "followers" ? [...out].sort((a, b) => b.followers - a.followers) : out;
  }, [all, q, cat, sort, onlySaved, saved]);

  return (
    <main className="px-5 pb-12">
      <PageTitle icon={Search} sub="카테고리와 키워드로 우리 브랜드에 맞는 크리에이터를 찾아 바로 제안하세요.">
        크리에이터 찾기
      </PageTitle>

      <label className="flex h-12 items-center gap-2 rounded-full bg-surface px-4 focus-within:ring-2 focus-within:ring-signal/40">
        <Search size={18} className="text-mute" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="이름, 태그, 지역으로 검색" className="min-w-0 flex-1 bg-transparent outline-none" />
      </label>

      <div className="mt-3">
        <Chips value={cat} options={["전체", ...CATEGORIES].map((c) => ({ key: c, label: c }))} onChange={setCat} />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-[13px] font-bold">
          {all ? `${list.length}명` : "불러오는 중…"}
        </p>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setOnlySaved(!onlySaved)} className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-bold ${onlySaved ? "bg-soft text-signal" : "bg-surface text-mute"}`}>
            <Heart size={13} fill={onlySaved ? "currentColor" : "none"} /> 관심
          </button>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="rounded-full bg-surface px-3 py-1.5 text-[12px] font-bold outline-none" style={{ fontSize: 12 }}>
            <option value="followers">팔로워 많은 순</option>
            <option value="recent">최근 업데이트 순</option>
          </select>
        </div>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        {list.map((c) => (
          <CreatorCard key={c.page.profile.handle} c={c} saved={saved.includes(c.page.profile.handle)} onOpen={() => setOpen(c)} />
        ))}
      </div>
      {all && list.length === 0 && <Empty icon={Search} title="조건에 맞는 크리에이터가 없어요" body="카테고리나 검색어를 바꿔 보세요." />}
      <p className="mt-6 text-center text-[12px] text-mute">‘예시’ 표시가 있는 크리에이터는 화면 설명용 가상 인물이에요.</p>

      {open && <CreatorSheet c={open} saved={saved.includes(open.page.profile.handle)} onClose={() => setOpen(null)} />}
    </main>
  );
}
