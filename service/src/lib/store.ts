"use client";

// Data layer. Every screen goes through these functions only. With Supabase
// settings in the build, real accounts and pages live there; without them
// (and always for the sample account) everything stays in browser storage.

import { useCallback, useEffect, useState } from "react";
import { BASE } from "./base";
import { demoPage } from "./demo";
import { local } from "./local";
import { remote } from "./remote";
import { supabase } from "./supabase";
import type { Block, KnilEvent, Page, Source } from "./types";

export const LIVE = !!supabase;
const server = supabase ? remote(supabase) : null;
const DEMO = demoPage.profile.handle;

export const HANDLE_RE = /^[a-z0-9._]{3,20}$/;
const RESERVED = new Set(["edit", "stats", "start", "login", "admin", "api", "app", "knil", "settings", "help", "dm", DEMO]);

function changed() {
  window.dispatchEvent(new Event("knil:change"));
}

const isDemo = (handle: string) => handle === DEMO || !server;

// Who is using the editor. `handle` is null for a signed-in account that
// has not picked its address yet.
export type Session = { handle: string | null; demo: boolean };

export async function getSession(): Promise<Session | null> {
  const h = local.session();
  if (h && (h === DEMO || !server)) return { handle: h, demo: true };
  if (!server) return null;
  if (!(await server.userId())) return null;
  const page = await server.myPage();
  return { handle: page?.profile.handle ?? null, demo: false };
}

export async function getMyPage(): Promise<Page | null> {
  const s = await getSession();
  if (!s?.handle) return null;
  return getPage(s.handle);
}

export async function getPage(handle: string): Promise<Page | null> {
  if (isDemo(handle)) return local.getPage(handle);
  return server!.getPage(handle);
}

export async function handleProblem(handle: string): Promise<string | null> {
  if (!HANDLE_RE.test(handle)) return "영문 소문자, 숫자, 마침표, 밑줄로 3~20자";
  if (RESERVED.has(handle)) return "사용할 수 없는 아이디입니다";
  if (server ? await server.taken(handle) : local.taken(handle)) return "이미 사용 중인 아이디입니다";
  return null;
}

export async function createPage(handle: string, name: string) {
  const blocks: Block[] = [{ id: uid(), type: "channels", items: [{ id: uid(), platform: "Instagram", url: "", followers: "" }] }];
  if (server) {
    await server.createPage(handle, name, blocks);
  } else {
    local.savePage({ profile: { handle, name, bio: "" }, blocks, updatedAt: Date.now() });
    local.signIn(handle);
  }
  changed();
}

export async function savePage(page: Page) {
  if (isDemo(page.profile.handle)) local.savePage(page);
  else await server!.savePage(page);
  changed();
}

// Turns a resized photo into something a page can reference.
export async function storeImage(dataUrl: string, handle: string): Promise<string> {
  return isDemo(handle) ? dataUrl : server!.upload(dataUrl);
}

export async function events(handle: string, since: number): Promise<KnilEvent[]> {
  if (isDemo(handle)) return local.events(handle).filter((e) => e.at >= since);
  return server!.events(handle, since);
}

export function record(e: Omit<KnilEvent, "at" | "source">) {
  const full = { ...e, at: Date.now(), source: detectSource() };
  if (isDemo(e.handle)) local.record(full);
  else server!.record(full);
}

export function tryDemo() {
  local.signIn(DEMO);
  changed();
}

export async function sendLoginLink(email: string) {
  await server!.sendLoginLink(email, `${location.origin}${BASE}/`);
}

export async function signOut() {
  local.signOut();
  if (server) await server.signOut();
  changed();
}

function detectSource(): Source {
  const p = new URLSearchParams(location.search);
  const hint = (p.get("from") || p.get("utm_source") || document.referrer).toLowerCase();
  if (hint.includes("instagram")) return "Instagram";
  if (hint.includes("youtu")) return "YouTube";
  if (hint.includes("tiktok")) return "TikTok";
  if (/google|naver|daum|bing/.test(hint)) return "검색";
  if (!hint || hint.startsWith(location.origin)) return "직접 방문";
  return "기타";
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// Loads a value and reloads it whenever any screen writes to the store or
// the sign-in state changes. `undefined` while loading.
export function useStore<T>(get: () => Promise<T>, deps: unknown[] = []): T | undefined {
  const [value, setValue] = useState<T>();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(get, deps);
  useEffect(() => {
    let alive = true;
    const update = () => load().then((v) => alive && setValue(() => v));
    update();
    window.addEventListener("knil:change", update);
    const sub = supabase?.auth.onAuthStateChange(() => setTimeout(update));
    return () => {
      alive = false;
      window.removeEventListener("knil:change", update);
      sub?.data.subscription.unsubscribe();
    };
  }, [load]);
  return value;
}
