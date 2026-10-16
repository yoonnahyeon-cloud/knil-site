"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChartColumn, EllipsisVertical, GripVertical, LayoutList, Pencil, Plus, Smartphone, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Avatar, CreatorPage } from "@/components/CreatorPage";
import { BLOCK_INFO, BlockForm, ImagePick, UploadContext, blockTitle, newBlock } from "@/components/BlockForm";
import { PhoneFrame } from "@/components/PhoneFrame";
import { Field, Sheet } from "@/components/Sheet";
import { Card, IconTile, Toggle } from "@/components/ui";
import { langOf } from "@/lib/i18n";
import { normalizeUrl } from "@/lib/image";
import Link from "next/link";
import { events, savePage, storeImage, useStore } from "@/lib/store";
import type { Block, BlockType, Page, Profile } from "@/lib/types";

export default function EditPage() {
  return <AppShell wide>{(page) => <Editor page={page} />}</AppShell>;
}

type Open = { kind: "profile" } | { kind: "add" } | { kind: "block"; block: Block; isNew: boolean } | null;

const PREVIEW_LANGS = ["ko", "en", "ja", "zh-CN"];

function Editor({ page }: { page: Page }) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [open, setOpen] = useState<Open>(null);
  const [error, setError] = useState("");
  // What the open sheet would save, so the phone shows it while typing.
  const [draft, setDraft] = useState<{ block?: Block; profile?: Profile } | null>(null);
  const [lang, setLang] = useState("ko");

  const commit = (next: Page) =>
    savePage(next).then(
      () => setError(""),
      () => setError("저장하지 못했어요. 연결을 확인하고 다시 시도해 주세요."),
    );
  const setBlocks = (blocks: Block[]) => commit({ ...page, blocks });
  const close = () => {
    setOpen(null);
    setDraft(null);
  };

  const shown: Page = {
    ...page,
    profile: draft?.profile ?? page.profile,
    blocks: draft?.block
      ? page.blocks.some((b) => b.id === draft.block!.id)
        ? page.blocks.map((b) => (b.id === draft.block!.id ? draft.block! : b))
        : [...page.blocks, draft.block]
      : page.blocks,
  };

  const phone = (width: number) => (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex gap-1.5 rounded-full bg-surface p-1">
        {PREVIEW_LANGS.map((c) => (
          <button key={c} onClick={() => setLang(c)} className={`rounded-full px-3 py-1.5 text-[12px] font-bold ${lang === c ? "bg-ink text-white" : "text-mute"}`}>
            {langOf(c).flag} {c === "zh-CN" ? "中文" : c.toUpperCase()}
          </button>
        ))}
      </div>
      <PhoneFrame width={width}>
        <CreatorPage page={shown} preview lang={lang} />
      </PhoneFrame>
      <p className="mt-4 flex items-center gap-1.5 text-[12px] text-mute">
        <Smartphone size={14} /> 방문자의 아이폰에 보이는 그대로예요
      </p>
    </div>
  );

  return (
    <UploadContext.Provider value={(d) => storeImage(d, page.profile.handle)}>
      <main className="lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-12 lg:pt-8">
        <div className="sticky top-14 z-20 bg-white/95 px-5 py-2 backdrop-blur lg:hidden">
          <div className="grid grid-cols-2 rounded-full bg-surface p-1">
            {(["edit", "preview"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)} className={`flex h-9 items-center justify-center gap-1.5 rounded-full text-[14px] font-bold ${mode === m ? "bg-white shadow-sm" : "text-mute"}`}>
                {m === "edit" ? <Pencil size={15} /> : <Smartphone size={15} />}
                {m === "edit" ? "편집" : "미리보기"}
              </button>
            ))}
          </div>
        </div>

        <div className={`px-5 pb-10 lg:px-0 ${mode === "preview" ? "hidden lg:block" : ""}`}>
          {error && <p className="mt-3 rounded-2xl bg-[#ffe8e8] px-4 py-2.5 text-[13px] text-[#c4262e]">{error}</p>}

          <h1 className="hidden text-[26px] font-extrabold tracking-[-0.04em] lg:block">프로필 링크</h1>

          <Card className="mt-4">
            <button onClick={() => setOpen({ kind: "profile" })} className="flex w-full items-center gap-4 text-left">
              <Avatar name={page.profile.name} src={page.profile.avatar} size={60} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[19px] font-extrabold tracking-tight">{page.profile.name}</p>
                <p className="truncate text-[13px] text-mute">{page.profile.bio || "소개를 입력해 주세요"}</p>
              </div>
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-surface px-3 py-1.5 text-[12px] font-bold">
                <Pencil size={13} /> 수정
              </span>
            </button>
            <VisitStrip handle={page.profile.handle} />
          </Card>

          <div className="mt-8 mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-[18px] font-extrabold tracking-tight">
              <LayoutList size={19} className="text-signal" /> 블록 {page.blocks.length}
            </h2>
            <span className="flex items-center gap-1 text-[12px] text-mute">
              <GripVertical size={14} /> 끌어서 순서 바꾸기
            </span>
          </div>

          <BlockList
            blocks={page.blocks}
            onReorder={setBlocks}
            onOpen={(b) => setOpen({ kind: "block", block: b, isNew: false })}
            onToggle={(b) => setBlocks(page.blocks.map((x) => (x.id === b.id ? { ...x, hidden: !x.hidden } : x)))}
          />

          <button onClick={() => setOpen({ kind: "add" })} className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-signal/40 bg-soft/50 font-bold text-signal">
            <Plus size={20} strokeWidth={2.6} /> 블록 추가
          </button>
        </div>

        {mode === "preview" && <div className="px-5 pt-4 pb-10 lg:hidden">{phone(Math.min(340, typeof window === "undefined" ? 340 : window.innerWidth - 40))}</div>}
        <aside className="relative z-[60] hidden lg:block">
          <div className="sticky top-8">{phone(360)}</div>
        </aside>

        {open?.kind === "profile" && (
          <ProfileSheet
            profile={page.profile}
            onDraft={(profile) => setDraft({ profile })}
            onClose={close}
            onSave={(profile) => {
              commit({ ...page, profile });
              close();
            }}
          />
        )}

        {open?.kind === "add" && (
          <Sheet title="블록 추가" onClose={close} aside>
            <div className="grid grid-cols-2 gap-2 pt-2">
              {(Object.keys(BLOCK_INFO) as BlockType[]).map((t) => (
                <button key={t} onClick={() => setOpen({ kind: "block", block: newBlock(t), isNew: true })} className="flex min-h-32 flex-col justify-between rounded-2xl bg-surface p-4 text-left">
                  <IconTile icon={BLOCK_INFO[t].icon} tone={BLOCK_INFO[t].tone} size={40} />
                  <span>
                    <span className="block text-[16px] font-extrabold">{BLOCK_INFO[t].name}</span>
                    <span className="text-[12px] leading-snug text-mute">{BLOCK_INFO[t].desc}</span>
                  </span>
                </button>
              ))}
            </div>
          </Sheet>
        )}

        {open?.kind === "block" && (
          <BlockSheet
            block={open.block}
            isNew={open.isNew}
            onDraft={(block) => setDraft({ block })}
            onClose={close}
            onSave={(b) => {
              setBlocks(open.isNew ? [...page.blocks, b] : page.blocks.map((x) => (x.id === b.id ? b : x)));
              close();
            }}
            onDelete={() => {
              setBlocks(page.blocks.filter((x) => x.id !== open.block.id));
              close();
            }}
          />
        )}
      </main>
    </UploadContext.Provider>
  );
}

// Block cards with a drag handle. Dragging reorders live; the new order is
// saved when the finger lifts.
function BlockList({ blocks, onReorder, onOpen, onToggle }: { blocks: Block[]; onReorder: (b: Block[]) => void; onOpen: (b: Block) => void; onToggle: (b: Block) => void }) {
  const [order, setOrder] = useState(blocks);
  const [drag, setDrag] = useState<{ id: string; y: number; grab: number } | null>(null);
  const list = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (!drag) setOrder(blocks);
  }, [blocks, drag]);

  useLayoutEffect(() => {
    const ul = list.current;
    if (!ul) return;
    for (const li of Array.from(ul.children) as HTMLElement[]) {
      li.style.transform = drag && li.dataset.id === drag.id ? `translateY(${drag.y - drag.grab - ul.getBoundingClientRect().top - li.offsetTop}px)` : "";
    }
  }, [drag, order]);

  const start = (id: string) => (e: React.PointerEvent) => {
    const li = (e.currentTarget as HTMLElement).closest("li")!;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ id, y: e.clientY, grab: e.clientY - li.getBoundingClientRect().top });
  };

  const move = (e: React.PointerEvent) => {
    if (!drag || !list.current) return;
    const ul = list.current;
    const items = Array.from(ul.children) as HTMLElement[];
    const me = items.find((li) => li.dataset.id === drag.id)!;
    const center = e.clientY - drag.grab + me.offsetHeight / 2 - ul.getBoundingClientRect().top;
    const before = items.filter((li) => li !== me && li.offsetTop + li.offsetHeight / 2 < center).length;
    const from = order.findIndex((b) => b.id === drag.id);
    if (before !== from) {
      const next = order.filter((b) => b.id !== drag.id);
      next.splice(before, 0, order[from]);
      setOrder(next);
    }
    setDrag({ ...drag, y: e.clientY });
  };

  const end = () => {
    if (!drag) return;
    setDrag(null);
    if (order.some((b, i) => b.id !== blocks[i]?.id)) onReorder(order);
  };

  return (
    <ul ref={list} className="relative space-y-2.5">
      {order.map((b) => {
        const info = BLOCK_INFO[b.type];
        const dragging = drag?.id === b.id;
        return (
          <li
            key={b.id}
            data-id={b.id}
            className={`flex items-stretch overflow-hidden rounded-2xl bg-white ring-1 ${dragging ? "relative z-10 shadow-2xl ring-signal" : "ring-rule transition-transform"}`}
          >
            <button
              onPointerDown={start(b.id)}
              onPointerMove={move}
              onPointerUp={end}
              onPointerCancel={end}
              aria-label="순서 바꾸기"
              className="flex w-10 shrink-0 cursor-grab touch-none items-center justify-center bg-surface text-mute active:cursor-grabbing"
            >
              <GripVertical size={18} />
            </button>
            <button onClick={() => onOpen(b)} className={`flex min-w-0 flex-1 items-center gap-3 px-3 py-3.5 text-left ${b.hidden ? "opacity-40" : ""}`}>
              <IconTile icon={info.icon} tone={info.tone} size={38} />
              <span className="min-w-0">
                <span className="block text-[12px] font-semibold text-mute">{info.name}</span>
                <span className="block truncate text-[15px] font-bold">{blockTitle(b)}</span>
              </span>
            </button>
            <div className="flex shrink-0 items-center gap-1 pr-3">
              <Toggle on={!b.hidden} onChange={() => onToggle(b)} label="공개" />
              <button onClick={() => onOpen(b)} aria-label="편집" className="grid size-8 place-items-center text-mute">
                <EllipsisVertical size={18} />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function ProfileSheet({ profile, onClose, onSave, onDraft }: { profile: Profile; onClose: () => void; onSave: (p: Profile) => void; onDraft: (p: Profile) => void }) {
  const [p, setDraft] = useState(profile);
  const setP = (next: Profile) => {
    setDraft(next);
    onDraft(next);
  };
  return (
    <Sheet title="프로필" onClose={onClose} onSave={() => p.name.trim() && onSave({ ...p, name: p.name.trim() })} aside>
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
  onDraft,
}: {
  block: Block;
  isNew: boolean;
  onClose: () => void;
  onSave: (b: Block) => void;
  onDelete: () => void;
  onDraft: (b: Block) => void;
}) {
  const [draft, setDraft] = useState(block);
  const change = (b: Block) => {
    setDraft(b);
    onDraft(b);
  };
  return (
    <Sheet title={BLOCK_INFO[block.type].name} onClose={onClose} onSave={() => onSave(cleanUrls(draft))} aside>
      <BlockForm block={draft} onChange={change} />
      {!isNew && (
        <button onClick={onDelete} className="mt-10 flex w-full items-center justify-center gap-1.5 rounded-full bg-[#fff0f0] py-3 text-[14px] font-bold text-[#d93036]">
          <Trash2 size={16} /> 이 블록 삭제
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
    <Link href="/stats" className="mt-4 flex items-center gap-4 rounded-2xl bg-surface px-4 py-3 text-[13px]">
      <span>
        오늘 <b className="text-signal">{views(today.getTime())}</b>
      </span>
      <span>
        7일 <b>{views(today.getTime() - 6 * DAY)}</b>
      </span>
      <span>
        30일 <b>{views(since)}</b>
      </span>
      <span className="ml-auto flex items-center gap-1 font-bold">
        <ChartColumn size={15} /> 통계
      </span>
    </Link>
  );
}
