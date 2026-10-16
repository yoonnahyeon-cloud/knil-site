"use client";

// Data layer. Every screen goes through these functions only, so swapping
// this browser-storage version for a real backend (Supabase or similar)
// touches this file and nothing else.

import { useEffect, useState } from "react";
import { demoEvents, demoPage } from "./demo";
import type { KnilEvent, Page, Source } from "./types";

const K = {
  pages: "knil:pages",
  events: "knil:events",
  session: "knil:session",
};

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
    window.dispatchEvent(new Event("knil:change"));
    return true;
  } catch {
    return false;
  }
}

function pages(): Record<string, Page> {
  const stored = read<Record<string, Page>>(K.pages, {});
  if (!stored[demoPage.profile.handle]) stored[demoPage.profile.handle] = demoPage;
  return stored;
}

export const HANDLE_RE = /^[a-z0-9._]{3,20}$/;
const RESERVED = new Set(["edit", "stats", "start", "admin", "api", "knil", "login", "settings", "help"]);

export function handleProblem(handle: string): string | null {
  if (!HANDLE_RE.test(handle)) return "영문 소문자, 숫자, 마침표, 밑줄로 3~20자";
  if (RESERVED.has(handle)) return "사용할 수 없는 아이디입니다";
  if (pages()[handle]) return "이미 사용 중인 아이디입니다";
  return null;
}

export function getPage(handle: string): Page | null {
  return pages()[handle] ?? null;
}

export function savePage(page: Page): boolean {
  const all = read<Record<string, Page>>(K.pages, {});
  all[page.profile.handle] = { ...page, updatedAt: Date.now() };
  return write(K.pages, all);
}

export function createPage(handle: string, name: string) {
  const page: Page = {
    profile: { handle, name, bio: "" },
    blocks: [
      { id: uid(), type: "channels", items: [{ id: uid(), platform: "Instagram", url: "", followers: "" }] },
    ],
    updatedAt: Date.now(),
  };
  savePage(page);
  signIn(handle);
}

export function getSession(): string | null {
  return read<string | null>(K.session, null);
}
export function signIn(handle: string) {
  write(K.session, handle);
}
export function signOut() {
  try {
    localStorage.removeItem(K.session);
    window.dispatchEvent(new Event("knil:change"));
  } catch {}
}

export function events(handle: string): KnilEvent[] {
  const own = read<KnilEvent[]>(K.events, []).filter((e) => e.handle === handle);
  return handle === demoPage.profile.handle ? [...demoEvents(), ...own] : own;
}

export function record(e: Omit<KnilEvent, "at" | "source">) {
  const all = read<KnilEvent[]>(K.events, []);
  all.push({ ...e, at: Date.now(), source: detectSource() });
  // Keep browser storage bounded; the real backend keeps everything.
  write(K.events, all.slice(-5000));
}

function detectSource(): Source {
  const p = new URLSearchParams(location.search);
  const hint = (p.get("from") || p.get("utm_source") || document.referrer).toLowerCase();
  if (hint.includes("instagram")) return "Instagram";
  if (hint.includes("youtu")) return "YouTube";
  if (hint.includes("tiktok")) return "TikTok";
  if (/google|naver|daum|bing/.test(hint)) return "검색";
  if (!hint) return "직접 방문";
  return "기타";
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// Re-render whenever any screen writes to the store.
export function useStore<T>(get: () => T): T | undefined {
  const [value, setValue] = useState<T>();
  useEffect(() => {
    const update = () => setValue(get());
    update();
    window.addEventListener("knil:change", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("knil:change", update);
      window.removeEventListener("storage", update);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return value;
}
