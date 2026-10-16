// Browser-storage backend. Used when no Supabase settings are configured,
// and always for the sample account so visitors can try the editor freely.

import { brandSamples, demoEvents, demoPage } from "./demo";
import type { KnilEvent, Page, Proposal, ProposalStatus } from "./types";

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
    return true;
  } catch {
    return false;
  }
}

function pages(): Record<string, Page> {
  const stored = read<Record<string, Page>>(K.pages, {});
  const d = demoPage.profile.handle;
  for (const b of brandSamples) if (!stored[b.profile.handle]) stored[b.profile.handle] = b;
  if (!stored[d]) stored[d] = demoPage;
  else {
    // Bring an older copy of the sample page up to date with the current sample.
    let p = stored[d];
    if (!p.chat) p = { ...p, chat: demoPage.chat };
    if (p.profile.name === "ROSIE" && !p.profile.avatar) p = { ...p, profile: { ...p.profile, name: demoPage.profile.name, avatar: demoPage.profile.avatar } };
    // Only once, so a deleted calendar block stays deleted.
    if (!p.blocks.some((b) => b.type === "calendar") && !read("knil:demo:cal", false)) {
      write("knil:demo:cal", true);
      const cal = demoPage.blocks.find((b) => b.type === "calendar")!;
      const at = p.blocks.findIndex((b) => b.type === "channels") + 1;
      p = { ...p, blocks: [...p.blocks.slice(0, at), cal, ...p.blocks.slice(at)] };
    }
    if (p !== stored[d]) {
      stored[d] = p;
      write(K.pages, stored);
    }
  }
  return stored;
}

export const local = {
  getPage(handle: string): Page | null {
    return pages()[handle] ?? null;
  },
  taken(handle: string) {
    return !!pages()[handle];
  },
  savePage(page: Page) {
    const all = read<Record<string, Page>>(K.pages, {});
    all[page.profile.handle] = { ...page, updatedAt: Date.now() };
    if (!write(K.pages, all)) throw new Error("이 기기의 저장 공간이 가득 찼어요. 사진 수를 줄여 주세요.");
  },
  session(): string | null {
    const s = read<string | { handle: string } | null>(K.session, null);
    return typeof s === "string" ? s : s?.handle ?? null;
  },
  signIn(handle: string) {
    write(K.session, handle);
  },
  signOut() {
    try {
      localStorage.removeItem(K.session);
    } catch {}
  },
  events(handle: string): KnilEvent[] {
    const own = read<KnilEvent[]>(K.events, []).filter((e) => e.handle === handle);
    return handle === demoPage.profile.handle ? [...demoEvents(), ...own] : own;
  },
  record(e: KnilEvent) {
    const all = read<KnilEvent[]>(K.events, []);
    all.push(e);
    write(K.events, all.slice(-5000));
  },
};

const PROPOSALS = "knil:proposals";

export const localProposals = {
  list(handle: string): Proposal[] {
    return read<Proposal[]>(PROPOSALS, []).filter((p) => p.handle === handle).sort((a, b) => b.at - a.at);
  },
  add(p: Proposal) {
    write(PROPOSALS, [...read<Proposal[]>(PROPOSALS, []), p]);
  },
  setStatus(id: string, status: ProposalStatus) {
    write(PROPOSALS, read<Proposal[]>(PROPOSALS, []).map((p) => (p.id === id ? { ...p, status } : p)));
  },
};
