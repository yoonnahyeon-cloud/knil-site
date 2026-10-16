"use client";

import { createContext, useContext, useState } from "react";
import { Images, Link2, Play, ShoppingBag, Users, type LucideIcon } from "lucide-react";
import { Field } from "@/components/Sheet";
import type { Tone } from "@/components/ui";
import { resizeImage } from "@/lib/image";
import { uid } from "@/lib/store";
import { PLATFORMS, type Block, type BlockType, type GalleryItem, type Platform, type ProductItem } from "@/lib/types";

export const BLOCK_INFO: Record<BlockType, { name: string; desc: string; icon: LucideIcon; tone: Tone }> = {
  channels: { name: "채널", desc: "Instagram, YouTube 등 내 채널과 팔로워 수", icon: Users, tone: "purple" },
  link: { name: "링크", desc: "쇼핑몰, 협업, 공동구매 등 바로 가기 한 줄", icon: Link2, tone: "ink" },
  video: { name: "영상", desc: "새 영상 하나를 크게 보여주기", icon: Play, tone: "pink" },
  gallery: { name: "룩 · 사진", desc: "옆으로 넘겨 보는 사진 모음", icon: Images, tone: "sky" },
  products: { name: "상품", desc: "내가 쓰는 제품과 가격", icon: ShoppingBag, tone: "mint" },
};

export function newBlock(type: BlockType): Block {
  const id = uid();
  switch (type) {
    case "channels":
      return { id, type, items: [{ id: uid(), platform: "Instagram", url: "", followers: "" }] };
    case "link":
      return { id, type, title: "", sub: "", label: "", url: "" };
    case "video":
      return { id, type, heading: "New Video", title: "", meta: "", duration: "", url: "" };
    case "gallery":
      return { id, type, title: "Daily Look", note: "", items: [{ id: uid(), label: "", url: "" }] };
    case "products":
      return { id, type, title: "Picks", note: "", items: [{ id: uid(), name: "", price: "", url: "" }] };
  }
}

export function blockTitle(b: Block): string {
  switch (b.type) {
    case "channels":
      return b.items.map((c) => c.platform).join(", ") || "채널";
    case "link":
      return b.title || "제목 없음";
    case "video":
      return b.title || "제목 없음";
    case "gallery":
    case "products":
      return `${b.title || "제목 없음"} · ${b.items.length}개`;
  }
}

// One form per block type. Edits a draft; the sheet saves it.
export function BlockForm({ block, onChange }: { block: Block; onChange: (b: Block) => void }) {
  const set = <K extends string>(key: K, value: unknown) => onChange({ ...block, [key]: value } as Block);

  switch (block.type) {
    case "link":
      return (
        <>
          <Field label="제목" value={block.title} onChange={(v) => set("title", v)} placeholder="Shop" />
          <Field label="설명" value={block.sub} onChange={(v) => set("sub", v)} placeholder="ROSIE SELECT · 상품 24개" />
          <Field label="오른쪽 문구" value={block.label} onChange={(v) => set("label", v)} placeholder="바로 가기" />
          <Field label="링크" type="url" value={block.url} onChange={(v) => set("url", v)} placeholder="https://" />
        </>
      );
    case "video":
      return (
        <>
          <ImagePick label="썸네일" value={block.image} onChange={(v) => set("image", v)} wide />
          <Field label="섹션 이름" value={block.heading} onChange={(v) => set("heading", v)} placeholder="New Video" />
          <Field label="영상 제목" value={block.title} onChange={(v) => set("title", v)} placeholder="가을 데일리 메이크업, 10분 루틴" />
          <Field label="설명" value={block.meta} onChange={(v) => set("meta", v)} placeholder="새 영상 · 2일 전" />
          <Field label="영상 길이" value={block.duration} onChange={(v) => set("duration", v)} placeholder="12:48" />
          <Field label="영상 링크" type="url" value={block.url} onChange={(v) => set("url", v)} placeholder="https://youtube.com/..." />
        </>
      );
    case "channels":
      return (
        <Items
          items={block.items}
          onChange={(items) => set("items", items)}
          make={() => ({ id: uid(), platform: "Instagram" as Platform, url: "", followers: "" })}
          addLabel="채널 추가"
          render={(c, upd) => (
            <>
              <label className="mt-2 block">
                <span className="text-[13px] font-semibold text-ink/70">채널</span>
                <select value={c.platform} onChange={(e) => upd({ ...c, platform: e.target.value as Platform })} className="field">
                  {PLATFORMS.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </label>
              <Field label="팔로워 수" value={c.followers} onChange={(v) => upd({ ...c, followers: v })} placeholder="28.6만" />
              <Field label="채널 링크" type="url" value={c.url} onChange={(v) => upd({ ...c, url: v })} placeholder="https://" />
            </>
          )}
        />
      );
    case "gallery":
      return (
        <>
          <Field label="섹션 이름" value={block.title} onChange={(v) => set("title", v)} placeholder="Daily Look" />
          <Field label="오른쪽 문구" value={block.note} onChange={(v) => set("note", v)} placeholder="4개의 룩" />
          <Items
            items={block.items}
            onChange={(items) => set("items", items)}
            make={(): GalleryItem => ({ id: uid(), label: "", url: "" })}
            addLabel="사진 추가"
            render={(g, upd) => (
              <>
                <ImagePick label="사진" value={g.image} onChange={(v) => upd({ ...g, image: v })} />
                <Field label="이름" value={g.label} onChange={(v) => upd({ ...g, label: v })} placeholder="니트와 데님" />
                <Field label="링크" type="url" value={g.url} onChange={(v) => upd({ ...g, url: v })} placeholder="https://" />
              </>
            )}
          />
        </>
      );
    case "products":
      return (
        <>
          <Field label="섹션 이름" value={block.title} onChange={(v) => set("title", v)} placeholder="Beauty Picks" />
          <Field label="오른쪽 문구" value={block.note} onChange={(v) => set("note", v)} placeholder="내가 쓰는 제품" />
          <Items
            items={block.items}
            onChange={(items) => set("items", items)}
            make={(): ProductItem => ({ id: uid(), name: "", price: "", url: "" })}
            addLabel="상품 추가"
            render={(p, upd) => (
              <>
                <ImagePick label="상품 사진" value={p.image} onChange={(v) => upd({ ...p, image: v })} />
                <Field label="상품명" value={p.name} onChange={(v) => upd({ ...p, name: v })} placeholder="립 틴트 03 로즈" />
                <Field label="가격" value={p.price} onChange={(v) => upd({ ...p, price: v })} placeholder="18,000원" />
                <Field label="구매 링크" type="url" value={p.url} onChange={(v) => upd({ ...p, url: v })} placeholder="https://" />
              </>
            )}
          />
        </>
      );
  }
}

function Items<T extends { id: string }>({
  items,
  onChange,
  make,
  render,
  addLabel,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  make: () => T;
  render: (item: T, update: (item: T) => void) => React.ReactNode;
  addLabel: string;
}) {
  const update = (i: number) => (item: T) => onChange(items.map((x, j) => (j === i ? item : x)));
  const move = (i: number, d: number) => {
    const next = [...items];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  return (
    <div className="mt-6 space-y-4">
      {items.map((item, i) => (
        <div key={item.id} className="rounded-2xl bg-white px-4 pt-3 pb-4 ring-1 ring-rule">
          <div className="flex items-center justify-between text-[13px] text-mute">
            <span>{i + 1}</span>
            <span className="flex gap-1">
              <SmallBtn disabled={i === 0} onClick={() => move(i, -1)}>
                ↑
              </SmallBtn>
              <SmallBtn disabled={i === items.length - 1} onClick={() => move(i, 1)}>
                ↓
              </SmallBtn>
              <SmallBtn onClick={() => onChange(items.filter((_, j) => j !== i))}>삭제</SmallBtn>
            </span>
          </div>
          {render(item, update(i))}
        </div>
      ))}
      <button onClick={() => onChange([...items, make()])} className="btn-ghost w-full border-dashed border-signal/50 text-signal">
        + {addLabel}
      </button>
    </div>
  );
}

export function SmallBtn({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...rest} className="h-8 min-w-8 px-2 text-[13px] text-ink disabled:opacity-20">
      {children}
    </button>
  );
}

// Where picked photos go: browser storage for the preview, Supabase Storage
// for real accounts. Provided by the editor.
export const UploadContext = createContext<(dataUrl: string) => Promise<string>>(async (d) => d);

export function ImagePick({ label, value, onChange, wide }: { label: string; value?: string; onChange: (v?: string) => void; wide?: boolean }) {
  const upload = useContext(UploadContext);
  const [busy, setBusy] = useState(false);
  return (
    <div className="mt-3">
      <span className="text-[13px] font-semibold text-ink/70">{label}</span>
      <div className="mt-1.5 flex items-end gap-3">
        <label className={`relative grid cursor-pointer place-items-center overflow-hidden rounded-xl border border-dashed border-mute bg-surface ${wide ? "aspect-video w-40" : "size-20"}`}>
          {value ? <img src={value} alt="" className="absolute inset-0 size-full object-cover" /> : <span className="text-[22px] text-mute">{busy ? "…" : "+"}</span>}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              setBusy(true);
              try {
                onChange(await upload(await resizeImage(f)));
              } catch {
                alert("사진을 올리지 못했어요. 다시 시도해 주세요.");
              } finally {
                setBusy(false);
              }
            }}
          />
        </label>
        {value && (
          <button onClick={() => onChange(undefined)} className="pb-1 text-[13px] text-mute underline">
            지우기
          </button>
        )}
      </div>
    </div>
  );
}
