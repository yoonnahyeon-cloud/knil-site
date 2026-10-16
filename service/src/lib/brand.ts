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

// ---- brand profile ----

export const BRAND_KINDS = ["브랜드", "기업", "병원 · 클리닉", "매장", "에이전시"] as const;
export type BrandProfile = { name: string; kind: string; intro: string; contact: string; site: string };
const PROFILE = "knil:brand";
export const emptyBrand: BrandProfile = { name: "", kind: "브랜드", intro: "", contact: "", site: "" };
// Until brand accounts live on the server, the brand view shows the sample clinic.
export const BRAND_HANDLE = "moliv";
const SAMPLE_BRAND: BrandProfile = { name: "모리브 MOLIV", kind: "병원 · 클리닉", intro: "리프팅 · 스킨부스터 · 안티에이징 클리닉", contact: "contact@moliv.example", site: "" };
export const getBrand = (): BrandProfile => ({ ...SAMPLE_BRAND, ...read<Partial<BrandProfile>>(PROFILE, {}) });
export const saveBrand = (b: BrandProfile) => write(PROFILE, b);

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
export const savedCreators = () => read<string[]>(SAVED, []);
export function toggleSaved(handle: string) {
  const s = savedCreators();
  write(SAVED, s.includes(handle) ? s.filter((h) => h !== handle) : [...s, handle]);
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
export const sentProposals = () => read<Sent[]>(SENT, []).sort((a, b) => b.at - a.at);
export function recordSent(p: Omit<Sent, "id" | "status" | "at">) {
  write(SENT, [...read<Sent[]>(SENT, []), { ...p, id: uid(), status: "sent", at: Date.now() }]);
}
export function setSentStatus(id: string, status: SentStatus) {
  write(SENT, read<Sent[]>(SENT, []).map((s) => (s.id === id ? { ...s, status } : s)));
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
export const campaigns = () => read<Campaign[]>(CAMPAIGNS, []).sort((a, b) => b.at - a.at);
export function saveCampaign(c: Omit<Campaign, "id" | "at"> & { id?: string }) {
  const all = read<Campaign[]>(CAMPAIGNS, []);
  if (c.id) write(CAMPAIGNS, all.map((x) => (x.id === c.id ? { ...x, ...c } : x)));
  else write(CAMPAIGNS, [...all, { ...c, id: uid(), at: Date.now() }]);
}
export function deleteCampaign(id: string) {
  write(CAMPAIGNS, read<Campaign[]>(CAMPAIGNS, []).filter((c) => c.id !== id));
}
