"use client";

// Visitor chat and page translation. Real pages talk to the `knil` Edge
// Function (supabase/functions/knil), which translates with Claude; the
// sample page and the storage-only preview keep everything in this browser.

import { demoAiReply, demoDict, demoPage, demoThreads } from "./demo";
import { KoreanError } from "./errors";
import { supabase } from "./supabase";
import type { ChatMessage, ChatSettings, ChatThread, Page } from "./types";

const DEMO = demoPage.profile.handle;
const isLocal = (handle: string) => handle === DEMO || !supabase;
const uid = () => Math.random().toString(36).slice(2, 10);

function changed() {
  window.dispatchEvent(new Event("knil:change"));
}

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
}

async function call<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase!.functions.invoke("knil", { body });
  if (error) throw new KoreanError(error);
  return data as T;
}

// ---- browser-storage chats (sample page and preview) ----

type Box = { threads: ChatThread[]; messages: Record<string, ChatMessage[]> };
const BOX = "knil:chats";

function box(): Box {
  const stored = read<Box | null>(BOX, null);
  if (stored) return stored;
  const seeded: Box = { threads: [], messages: {} };
  for (const d of demoThreads) {
    seeded.threads.push({ ...d.thread, last: d.messages.at(-1)!.ko });
    seeded.messages[d.thread.id] = d.messages;
  }
  return seeded;
}

function addLocal(id: string, m: ChatMessage, unread: boolean) {
  const b = box();
  b.messages[id] = [...(b.messages[id] ?? []), m];
  b.threads = b.threads.map((t) => (t.id === id ? { ...t, last: m.ko, at: m.at, unread: unread ? t.unread + 1 : t.unread } : t));
  write(BOX, b);
  changed();
}

// ---- page translation ----

export async function pageTranslation(handle: string, lang: string): Promise<Record<string, string> | null> {
  if (lang === "ko") return null;
  if (isLocal(handle)) return demoDict(lang);
  const key = `knil:tr:${handle}:${lang}`;
  try {
    const hit = sessionStorage.getItem(key);
    if (hit) return JSON.parse(hit);
  } catch {}
  const { dict } = await call<{ dict: Record<string, string> }>({ action: "page", handle, lang });
  try {
    sessionStorage.setItem(key, JSON.stringify(dict));
  } catch {}
  return dict;
}

// ---- visitor side ----

type Mine = { chatId: string; token: string };
const mineKey = (handle: string) => `knil:chat:${handle}`;

export async function visitorMessages(handle: string): Promise<ChatMessage[]> {
  const mine = read<Mine | null>(mineKey(handle), null);
  if (!mine) return [];
  if (isLocal(handle)) return box().messages[mine.chatId] ?? [];
  const { messages } = await call<{ messages: ChatMessage[] }>({ action: "history", chatId: mine.chatId, token: mine.token });
  return messages;
}

export async function visitorSend(handle: string, lang: string, name: string, text: string): Promise<void> {
  let mine = read<Mine | null>(mineKey(handle), null);
  if (isLocal(handle)) {
    if (!mine) {
      mine = { chatId: uid(), token: uid() };
      write(mineKey(handle), mine);
      const b = box();
      b.threads.unshift({ id: mine.chatId, handle, lang, name: name || "Visitor", last: "", unread: 0, at: Date.now() });
      write(BOX, b);
    }
    const at = Date.now();
    // The preview cannot translate, so the creator sees the visitor's words.
    addLocal(mine.chatId, { id: uid(), from: "visitor", visitor: text, ko: text, at }, true);
    const page = handle === DEMO ? demoPage : null;
    if (page?.chat?.ai) addLocal(mine.chatId, { id: uid(), from: "ai", ...demoAiReply(lang), at: at + 1 }, false);
    return;
  }
  const res = await call<{ chatId: string; token: string }>({ action: "send", handle, lang, name, text, chatId: mine?.chatId, token: mine?.token });
  if (!mine) write(mineKey(handle), { chatId: res.chatId, token: res.token });
  changed();
}

// ---- creator side ----

export async function threads(handle: string): Promise<ChatThread[]> {
  if (isLocal(handle)) return box().threads.filter((t) => t.handle === handle).sort((a, b) => b.at - a.at);
  const { data, error } = await supabase!
    .from("chats")
    .select("id, handle, lang, name, last_text, unread, updated_at")
    .eq("handle", handle)
    .order("updated_at", { ascending: false });
  if (error || !data) return [];
  return data.map((r) => ({ id: r.id, handle: r.handle, lang: r.lang, name: r.name, last: r.last_text, unread: r.unread, at: Date.parse(r.updated_at) }));
}

export async function threadMessages(handle: string, id: string): Promise<ChatMessage[]> {
  if (isLocal(handle)) return box().messages[id] ?? [];
  const { data, error } = await supabase!.from("messages").select("id, sender, text_ko, text_visitor, at").eq("chat_id", id).order("at");
  if (error || !data) return [];
  return data.map((r) => ({ id: String(r.id), from: r.sender, ko: r.text_ko, visitor: r.text_visitor, at: Date.parse(r.at) }));
}

export async function ownerReply(handle: string, id: string, text: string) {
  if (isLocal(handle)) {
    // The preview cannot translate, so the visitor sees the Korean.
    addLocal(id, { id: uid(), from: "owner", ko: text, visitor: text, at: Date.now() }, false);
    return;
  }
  await call({ action: "reply", chatId: id, text });
  changed();
}

export async function markRead(handle: string, id: string) {
  if (isLocal(handle)) {
    const b = box();
    if (!b.threads.some((t) => t.id === id && t.unread)) return;
    b.threads = b.threads.map((t) => (t.id === id ? { ...t, unread: 0 } : t));
    write(BOX, b);
    changed();
    return;
  }
  await supabase!.from("chats").update({ unread: 0 }).eq("id", id);
  changed();
}

export const DEFAULT_CHAT: ChatSettings = { on: false, ai: true, guide: "" };

export async function saveChatSettings(page: Page, chat: ChatSettings) {
  const { savePage } = await import("./store");
  if (isLocal(page.profile.handle)) return savePage({ ...page, chat });
  const { error } = await supabase!.from("pages").update({ chat }).eq("handle", page.profile.handle);
  if (error) throw new KoreanError(error);
  changed();
}
