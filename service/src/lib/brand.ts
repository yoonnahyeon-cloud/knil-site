"use client";

// Brand side of KNIL: brands, companies and clinics looking for creators.
// For now one sign-in can switch between the creator and brand views (for
// testing), and brand data stays in this browser.

import { useEffect, useState } from "react";
import { showcase } from "./demo";
import { getPage, publicPages, uid } from "./store";
import type { Block, Page } from "./types";

export type Mode = "creator" | "brand";
const MODE = "knil:mode";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
  window.dispatchEvent(new Event("knil:change"));
}

export function getMode(): Mode {
  return read<Mode>(MODE, "creator") === "brand" ? "brand" : "creator";
}
export function setMode(m: Mode) {
  write(MODE, m);
}
export function useMode(): Mode {
  const [mode, set] = useState<Mode>("creator");
  useEffect(() => {
    const update = () => set(getMode());
    update();
    window.addEventListener("knil:change", update);
    return () => window.removeEventListener("knil:change", update);
  }, []);
  return mode;
}

// ---- brand accounts ----

// One sign-in can run several brand accounts (a clinic, a cosmetics brand).
// Until brand accounts live on the server these are sample accounts, and
// everything a brand does stays in this browser, kept apart per account.

export const BRAND_KINDS = ["브랜드", "기업", "병원 · 클리닉", "매장", "에이전시"] as const;
export type BrandProfile = { name: string; kind: string; intro: string; contact: string; site: string };
export const emptyBrand: BrandProfile = { name: "", kind: "브랜드", intro: "", contact: "", site: "" };

export const BRAND_ACCOUNTS: { handle: string; sample: BrandProfile }[] = [
  { handle: "moliv", sample: { name: "모리브 MOLIV", kind: "병원 · 클리닉", intro: "리프팅 · 스킨부스터 · 안티에이징 클리닉", contact: "contact@moliv.example", site: "" } },
  { handle: "flowy", sample: { name: "플로위 FLOWY", kind: "브랜드", intro: "민감 피부를 위한 비건 스킨케어", contact: "collab@flowy.example", site: "" } },
];

const ACTIVE = "knil:brand:active";
export function activeBrand(): string {
  const h = read<string>(ACTIVE, BRAND_ACCOUNTS[0].handle);
  return BRAND_ACCOUNTS.some((a) => a.handle === h) ? h : BRAND_ACCOUNTS[0].handle;
}
export const setActiveBrand = (handle: string) => write(ACTIVE, handle);

// Storage key for one account's data. The first account keeps the keys it
// had before there were several, so nothing saved earlier is lost.
const keyOf = (base: string, handle = activeBrand()) => (handle === BRAND_ACCOUNTS[0].handle ? base : `${base}:${handle}`);

const PROFILE = "knil:brand";
export function getBrand(handle = activeBrand()): BrandProfile {
  const sample = BRAND_ACCOUNTS.find((a) => a.handle === handle)?.sample ?? emptyBrand;
  return { ...sample, ...read<Partial<BrandProfile>>(keyOf(PROFILE, handle), {}) };
}
export const saveBrand = (b: BrandProfile) => write(keyOf(PROFILE), b);
export const isClinic = (b: BrandProfile) => b.kind.includes("병원");

// ---- creators to discover ----

export type Creator = {
  page: Page;
  sample: boolean;
  followers: number;
  channels: { platform: string; followers: string }[];
};

// "28.6만" / "12,000" / "1.2M" -> a number, for sorting and totals.
export function parseFollowers(s: string): number {
  const t = s.replace(/[,\s]/g, "");
  const n = parseFloat(t);
  if (!Number.isFinite(n)) return 0;
  if (/만/.test(t)) return n * 10000;
  if (/천|k/i.test(t)) return n * 1000;
  if (/m/i.test(t)) return n * 1000000;
  return n;
}

export function formatFollowers(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(n >= 100000 ? 0 : 1).replace(/\.0$/, "")}만`;
  return n.toLocaleString("ko-KR");
}

function toCreator(page: Page, sample: boolean): Creator {
  const ch = page.blocks.find((b): b is Extract<Block, { type: "channels" }> => b.type === "channels");
  const channels = (ch?.items ?? []).filter((c) => c.followers).map((c) => ({ platform: c.platform, followers: c.followers }));
  return { page, sample, channels, followers: channels.reduce((s, c) => s + parseFollowers(c.followers), 0) };
}

export async function listCreators(): Promise<Creator[]> {
  const out: Creator[] = [];
  for (const p of await publicPages()) if (p.profile.handle !== "rosie") out.push(toCreator(p, false));
  const rosie = await getPage("rosie");
  for (const p of showcase) out.push(toCreator(p.profile.handle === "rosie" && rosie ? { ...rosie, portfolio: rosie.portfolio ?? p.portfolio } : p, true));
  return out;
}

// ---- saved creators, sent proposals, campaigns ----

const SAVED = "knil:brand:saved";
export const savedCreators = () => read<string[]>(keyOf(SAVED), seed().saved);
export function toggleSaved(handle: string) {
  const s = savedCreators();
  write(keyOf(SAVED), s.includes(handle) ? s.filter((h) => h !== handle) : [...s, handle]);
}

export type SentStatus = "sent" | "talking" | "agreed" | "closed";
export const SENT_STATUS: { key: SentStatus; label: string }[] = [
  { key: "sent", label: "보냄" },
  { key: "talking", label: "협의 중" },
  { key: "agreed", label: "확정" },
  { key: "closed", label: "종료" },
];
export type Sent = { id: string; handle: string; name: string; message: string; budget: string; status: SentStatus; at: number };
const SENT = "knil:brand:sent";
const sentAll = () => read<Sent[]>(keyOf(SENT), seed().sent);
export const sentProposals = () => [...sentAll()].sort((a, b) => b.at - a.at);
export function recordSent(p: Omit<Sent, "id" | "status" | "at">) {
  write(keyOf(SENT), [...sentAll(), { ...p, id: uid(), status: "sent", at: Date.now() }]);
}
export function setSentStatus(id: string, status: SentStatus) {
  write(keyOf(SENT), sentAll().map((s) => (s.id === id ? { ...s, status } : s)));
}

export type Campaign = {
  id: string;
  title: string;
  category: string;
  reward: string;
  slots: string;
  deadline: string;
  body: string;
  at: number;
};
const CAMPAIGNS = "knil:brand:campaigns";
const campAll = () => read<Campaign[]>(keyOf(CAMPAIGNS), seed().campaigns);
export const campaigns = () => [...campAll()].sort((a, b) => b.at - a.at);
export function saveCampaign(c: Omit<Campaign, "id" | "at"> & { id?: string }) {
  const all = campAll();
  if (c.id) write(keyOf(CAMPAIGNS), all.map((x) => (x.id === c.id ? { ...x, ...c } : x)));
  else write(keyOf(CAMPAIGNS), [...all, { ...c, id: uid(), at: Date.now() }]);
}
export function deleteCampaign(id: string) {
  write(keyOf(CAMPAIGNS), campAll().filter((c) => c.id !== id));
}

// What the sample cosmetics brand starts with, so its admin is not empty.
function seed(): { saved: string[]; sent: Sent[]; campaigns: Campaign[] } {
  if (activeBrand() !== "flowy") return { saved: [], sent: [], campaigns: [] };
  const day = 86400000;
  const now = Date.now();
  const inDays = (n: number) => new Date(now + n * day).toISOString().slice(0, 10);
  return {
    saved: ["rosie", "yuna.glow"],
    sent: [
      { id: "s1", handle: "rosie", name: "ROSIE YOON", message: "시카 진정 토너 릴스 1회, 공동구매 1회 제안드려요.", budget: "100만원 + 제품", status: "agreed", at: now - 6 * day },
      { id: "s2", handle: "yuna.glow", name: "YUNA", message: "샤오홍슈 장벽 크림 리뷰 2회 부탁드려요.", budget: "80만원", status: "talking", at: now - 2 * day },
      { id: "s3", handle: "sora.home", name: "SORA", message: "욕실 수납 콘텐츠에 클렌징 폼을 자연스럽게 노출해 주세요.", budget: "제품 제공", status: "sent", at: now - 5 * 3600000 },
    ],
    campaigns: [
      { id: "c1", title: "시카 진정 토너 리뷰 크리에이터 모집", category: "뷰티", reward: "제품 + 30만원", slots: "10", deadline: inDays(9), body: "민감 피부 진정 루틴을 릴스로 보여주실 분을 찾아요.", at: now - 3 * day },
      { id: "c2", title: "성수 팝업스토어 방문 콘텐츠", category: "뷰티", reward: "팝업 키트 + 20만원", slots: "5", deadline: inDays(16), body: "팝업 방문기와 신제품 체험을 담아 주세요.", at: now - day },
    ],
  };
}
