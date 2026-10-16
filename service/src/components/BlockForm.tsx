"use client";

import { createContext, useContext, useState } from "react";
import { CalendarCheck, CalendarDays, Images, Link2, MapPin, Play, ShoppingBag, Users, type LucideIcon } from "lucide-react";
import { Field } from "@/components/Sheet";
import type { Tone } from "@/components/ui";
import { resizeImage } from "@/lib/image";
import { uid } from "@/lib/store";
import { EVENT_KINDS, PLATFORMS, type Block, type BlockType, type CalendarEvent, type EventKind, type GalleryItem, type Platform, type ProductItem, type Treatment } from "@/lib/types";

export const BLOCK_INFO: Record<BlockType, { name: string; desc: string; icon: LucideIcon; tone: Tone }> = {
  channels: { name: "SNS 계정", desc: "Instagram, YouTube 등 내 계정 바로 가기", icon: Users, tone: "purple" },
  calendar: { name: "캘린더", desc: "공구, 기획전, 라이브 일정을 달력으로", icon: CalendarDays, tone: "amber" },
  link: { name: "링크", desc: "쇼핑몰, 협업, 공동구매 등 바로 가기 한 줄", icon: Link2, tone: "ink" },
  video: { name: "영상", desc: "새 영상 하나를 크게 보여주기", icon: Play, tone: "pink" },
  gallery: { name: "룩 · 사진", desc: "옆으로 넘겨 보는 사진 모음", icon: Images, tone: "sky" },
  products: { name: "상품", desc: "내가 쓰는 제품과 가격", icon: ShoppingBag, tone: "mint" },
  booking: { name: "상담 예약", desc: "시술 · 서비스를 고르고 날짜를 정해 예약 요청", icon: CalendarCheck, tone: "purple" },
  place: { name: "오시는 길", desc: "주소, 운영 시간, 전화, 지도", icon: MapPin, tone: "soft" },
};

// Which blocks each kind of page offers, in the order shown in "블록 추가".
export const CREATOR_BLOCKS: BlockType[] = ["channels", "calendar", "link", "video", "gallery", "products"];
export const BRAND_BLOCKS: BlockType[] = ["booking", "place", "channels", "products", "gallery", "calendar", "video", "link"];

export function newBlock(type: BlockType): Block {
  const id = uid();
  switch (type) {
    case "channels":
      return { id, type, items: [{ id: uid(), platform: "Instagram", url: "", followers: "" }] };
    case "calendar":
      return { id, type, title: "이번 달 일정", note: "", items: [{ id: uid(), title: "", start: today(), end: "", kind: "공구", url: "" }] };
    case "link":
      return { id, type, title: "", sub: "", label: "", url: "" };
    case "video":
      return { id, type, heading: "New Video", title: "", meta: "", duration: "", url: "" };
    case "gallery":
      return { id, type, title: "Daily Look", note: "", items: [{ id: uid(), label: "", url: "" }] };
    case "products":
      return { id, type, title: "Picks", note: "", items: [{ id: uid(), name: "", price: "", url: "" }] };
    case "booking":
      return { id, type, title: "상담 예약", note: "", items: [{ id: uid(), name: "", price: "", duration: "" }] };
    case "place":
      return { id, type, title: "오시는 길", address: "", hours: "", phone: "", map: "" };
  }
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function blockTitle(b: Block): string {
  switch (b.type) {
    case "channels":
      return b.items.map((c) => c.platform).join(" · ") || "계정을 추가해 주세요";
    case "calendar":
      return `${b.title || "캘린더"} · 일정 ${b.items.length}개`;
    case "link":
      return b.title || "제목 없음";
    case "video":
      return b.title || "제목 없음";
    case "gallery":
    case "products":
      return `${b.title || "제목 없음"} · ${b.items.length}개`;
    case "booking":
      return `${b.title || "상담 예약"} · 시술 ${b.items.length}개`;
    case "place":
      return b.address || "주소를 입력해 주세요";
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
    case "calendar":
      return (
        <>
          <Field label="제목" value={block.title} onChange={(v) => set("title", v)} placeholder="10월 공구 일정" />
          <Field label="오른쪽 문구" value={block.note} onChange={(v) => set("note", v)} placeholder="알림 받으려면 DM 주세요" />
          <Items
            items={block.items}
            onChange={(items) => set("items", items)}
            make={(): CalendarEvent => ({ id: uid(), title: "", start: today(), end: "", kind: "공구", url: "" })}
            addLabel="일정 추가"
            render={(ev, upd) => (
              <>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {EVENT_KINDS.map((k) => (
                    <button key={k} type="button" onClick={() => upd({ ...ev, kind: k as EventKind })} className={`rounded-full px-3 py-1 text-[13px] font-bold ${ev.kind === k ? "bg-ink text-white" : "bg-surface"}`}>
                      {k}
                    </button>
                  ))}
                </div>
                <Field label="일정 이름" value={ev.title} onChange={(v) => upd({ ...ev, title: v })} placeholder="수분 쿠션 공구" />
                <div className="grid grid-cols-2 gap-2">
                  <Field label="시작일" type="date" value={ev.start} onChange={(v) => upd({ ...ev, start: v, end: ev.end && ev.end < v ? v : ev.end })} />
                  <Field label="종료일 (선택)" type="date" value={ev.end} onChange={(v) => upd({ ...ev, end: v && v < ev.start ? ev.start : v })} />
                </div>
                <Field label="링크 (선택)" type="url" value={ev.url} onChange={(v) => upd({ ...ev, url: v })} placeholder="https://" />
              </>
            )}
          />
        </>
      );
    case "channels":
      return (
        <>
        <label className="mt-2 flex items-center justify-between rounded-2xl bg-surface px-4 py-3">
          <span className="text-[14px] font-semibold">팔로워 수 보이기</span>
          <input type="checkbox" checked={!!block.showFollowers} onChange={(e) => set("showFollowers", e.target.checked)} className="size-5 accent-[#7c4dff]" />
        </label>
        <Items
          items={block.items}
          onChange={(items) => set("items", items)}
          make={() => ({ id: uid(), platform: "Instagram" as Platform, url: "", followers: "" })}
          addLabel="계정 추가"
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
        </>
      );
    case "booking":
      return (
        <>
          <p className="mt-2 rounded-2xl bg-soft px-4 py-3 text-[13px] leading-relaxed text-ink/80">
            방문자가 시술과 날짜를 골라 예약을 요청하면 <b>채팅</b>으로 들어와요. 외국어로 와도 한국어로 보여요.
          </p>
          <Field label="제목" value={block.title} onChange={(v) => set("title", v)} placeholder="상담 예약" />
          <Field label="오른쪽 문구" value={block.note} onChange={(v) => set("note", v)} placeholder="외국어 상담 가능" />
          <Items
            items={block.items}
            onChange={(items) => set("items", items)}
            make={(): Treatment => ({ id: uid(), name: "", price: "", duration: "" })}
            addLabel="시술 · 서비스 추가"
            render={(it, upd) => (
              <>
                <Field label="이름" value={it.name} onChange={(v) => upd({ ...it, name: v })} placeholder="리쥬란 힐러" />
                <div className="grid grid-cols-2 gap-2">
                  <Field label="가격 (선택)" value={it.price} onChange={(v) => upd({ ...it, price: v })} placeholder="상담 후 안내" />
                  <Field label="소요 시간 (선택)" value={it.duration} onChange={(v) => upd({ ...it, duration: v })} placeholder="30분" />
                </div>
              </>
            )}
          />
        </>
      );
    case "place":
      return (
        <>
          <Field label="제목" value={block.title} onChange={(v) => set("title", v)} placeholder="오시는 길" />
          <Field label="주소" value={block.address} onChange={(v) => set("address", v)} placeholder="서울 강남구 압구정로 000, 5층" />
          <Field label="운영 시간" value={block.hours} onChange={(v) => set("hours", v)} placeholder={"평일 10:00 – 20:00\n토요일 10:00 – 16:00"} multiline />
          <Field label="전화번호" type="tel" value={block.phone} onChange={(v) => set("phone", v)} placeholder="02-000-0000" />
          <Field label="지도 링크 (선택)" type="url" value={block.map} onChange={(v) => set("map", v)} placeholder="네이버 지도, 구글 지도 공유 링크" />
        </>
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
