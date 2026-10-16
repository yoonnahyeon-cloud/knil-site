"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Avatar, CreatorPage } from "@/components/CreatorPage";
import { BLOCK_INFO, BlockForm, ImagePick, SmallBtn, UploadContext, blockTitle, newBlock } from "@/components/BlockForm";
import { Field, Sheet } from "@/components/Sheet";
import { normalizeUrl } from "@/lib/image";
import Link from "next/link";
import { events, savePage, storeImage, useStore } from "@/lib/store";
import type { Block, BlockType, Page, Profile } from "@/lib/types";

export default function EditPage() {
  return <AppShell>{(page) => <Editor page={page} />}</AppShell>;
}

type Open = { kind: "profile" } | { kind: "add" } | { kind: "block"; block: Block; isNew: boolean } | null;

function Editor({ page }: { page: Page }) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [open, setOpen] = useState<Open>(null);
  const [error, setError] = useState("");

  const commit = (next: Page) =>
    savePage(next).then(
      () => setError(""),
      () => setError("저장하지 못했어요. 연결을 확인하고 다시 시도해 주세요."),
    );
  const setBlocks = (blocks: Block[]) => commit({ ...page, blocks });
  const move = (i: number, d: number) => {
    const next = [...page.blocks];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    setBlocks(next);
  };

  return (
    <UploadContext.Provider value={(d) => storeImage(d, page.profile.handle)}>
    <main>
      <div className="sticky top-14 z-20 grid grid-cols-2 border-b border-rule bg-paper">
        {(["edit", "preview"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} className={`h-11 text-[14px] ${mode === m ? "font-bold" : "text-mute"}`}>
            {m === "edit" ? "편집" : "미리보기"}
          </button>
        ))}
      </div>

      {error && <p className="bg-signal px-5 py-2 text-[13px] text-white">{error}</p>}

      {mode === "preview" ? (
        <div className="border-b border-rule">
          <CreatorPage page={page} preview />
        </div>
      ) : (
        <div className="px-5 pb-10">
          <button onClick={() => setOpen({ kind: "profile" })} className="flex w-full items-center gap-4 py-6 text-left">
            <Avatar name={page.profile.name} src={page.profile.avatar} size={56} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[20px] font-bold tracking-tight">{page.profile.name}</p>
              <p className="truncate text-[14px] text-mute">{page.profile.bio || "소개를 입력해 주세요"}</p>
            </div>
            <span className="shrink-0 text-[13px] text-mute">수정</span>
          </button>

          <VisitStrip handle={page.profile.handle} />

          <ul className="border-t border-ink">
            {page.blocks.map((b, i) => (
              <li key={b.id} className="flex items-center border-b border-rule">
                <button onClick={() => setOpen({ kind: "block", block: b, isNew: false })} className={`min-w-0 flex-1 py-4 text-left ${b.hidden ? "opacity-40" : ""}`}>
                  <span className="text-[12px] text-mute">{BLOCK_INFO[b.type].name}</span>
                  <span className="block truncate text-[15px] font-semibold">{blockTitle(b)}</span>
                </button>
                <SmallBtn onClick={() => setBlocks(page.blocks.map((x) => (x.id === b.id ? { ...x, hidden: !x.hidden } : x)))}>
                  {b.hidden ? "숨김" : "공개"}
                </SmallBtn>
                <SmallBtn disabled={i === 0} onClick={() => move(i, -1)} aria-label="위로">
                  ↑
                </SmallBtn>
                <SmallBtn disabled={i === page.blocks.length - 1} onClick={() => move(i, 1)} aria-label="아래로">
                  ↓
                </SmallBtn>
              </li>
            ))}
          </ul>

          <button onClick={() => setOpen({ kind: "add" })} className="btn mt-6 w-full">
            + 블록 추가
          </button>
        </div>
      )}

      {open?.kind === "profile" && (
        <ProfileSheet profile={page.profile} onClose={() => setOpen(null)} onSave={(profile) => (commit({ ...page, profile }), setOpen(null))} />
      )}

      {open?.kind === "add" && (
        <Sheet title="블록 추가" onClose={() => setOpen(null)}>
          {(Object.keys(BLOCK_INFO) as BlockType[]).map((t) => (
            <button key={t} onClick={() => setOpen({ kind: "block", block: newBlock(t), isNew: true })} className="block w-full border-b border-rule py-4 text-left">
              <span className="block text-[16px] font-semibold">{BLOCK_INFO[t].name}</span>
              <span className="text-[13px] text-mute">{BLOCK_INFO[t].desc}</span>
            </button>
          ))}
        </Sheet>
      )}

      {open?.kind === "block" && (
        <BlockSheet
          block={open.block}
          isNew={open.isNew}
          onClose={() => setOpen(null)}
          onSave={(b) => {
            setBlocks(open.isNew ? [...page.blocks, b] : page.blocks.map((x) => (x.id === b.id ? b : x)));
            setOpen(null);
          }}
          onDelete={() => {
            setBlocks(page.blocks.filter((x) => x.id !== open.block.id));
            setOpen(null);
          }}
        />
      )}
    </main>
    </UploadContext.Provider>
  );
}

function ProfileSheet({ profile, onClose, onSave }: { profile: Profile; onClose: () => void; onSave: (p: Profile) => void }) {
  const [p, setP] = useState(profile);
  return (
    <Sheet title="프로필" onClose={onClose} onSave={() => p.name.trim() && onSave({ ...p, name: p.name.trim() })}>
      <ImagePick label="프로필 사진" value={p.avatar} onChange={(avatar) => setP({ ...p, avatar })} />
      <Field label="이름" value={p.name} onChange={(name) => setP({ ...p, name })} />
      <Field label="소개" value={p.bio} onChange={(bio) => setP({ ...p, bio })} placeholder="beauty, fashion, daily life" multiline />
    </Sheet>
  );
}

function BlockSheet({
  block,
  isNew,
  onClose,
  onSave,
  onDelete,
}: {
  block: Block;
  isNew: boolean;
  onClose: () => void;
  onSave: (b: Block) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState(block);
  return (
    <Sheet title={BLOCK_INFO[block.type].name} onClose={onClose} onSave={() => onSave(cleanUrls(draft))}>
      <BlockForm block={draft} onChange={setDraft} />
      {!isNew && (
        <button onClick={onDelete} className="mt-10 w-full py-3 text-[14px] text-signal">
          이 블록 삭제
        </button>
      )}
    </Sheet>
  );
}

function cleanUrls(b: Block): Block {
  if ("url" in b) b = { ...b, url: normalizeUrl(b.url) };
  if ("items" in b) b = { ...b, items: b.items.map((it: { url: string }) => ({ ...it, url: normalizeUrl(it.url) })) } as Block;
  return b;
}

const DAY = 86400000;

// "오늘 · 7일 · 30일" visits at a glance, linking to the full statistics.
function VisitStrip({ handle }: { handle: string }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const since = today.getTime() - 29 * DAY;
  const list = useStore(() => events(handle, since), [handle, since]);
  const views = (from: number) => (list ? list.filter((e) => e.kind === "view" && e.at >= from).length.toLocaleString("ko-KR") : "–");
  return (
    <Link href="/stats" className="mb-5 flex items-center gap-4 bg-white px-4 py-3 text-[14px]">
      <span>
        오늘 <b>{views(today.getTime())}</b>
      </span>
      <span>
        7일 <b>{views(today.getTime() - 6 * DAY)}</b>
      </span>
      <span>
        30일 <b>{views(since)}</b>
      </span>
      <span className="ml-auto text-mute">통계 ›</span>
    </Link>
  );
}
