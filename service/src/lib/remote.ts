// Supabase backend. Tables and access rules: supabase/schema.sql.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Block, KnilEvent, Page, Portfolio, Proposal, ProposalStatus, Source } from "./types";

type Row = { handle: string; name: string; bio: string; avatar_url: string | null; blocks: Block[]; updated_at: string; portfolio?: Portfolio | null };

const toPage = (r: Row): Page => ({
  profile: { handle: r.handle, name: r.name, bio: r.bio, avatar: r.avatar_url ?? undefined },
  blocks: r.blocks ?? [],
  updatedAt: Date.parse(r.updated_at),
  portfolio: r.portfolio ?? undefined,
});

type ProposalRow = { id: number; handle: string; brand: string; contact: string; budget: string; message: string; status: ProposalStatus; created_at: string };

export function remote(db: SupabaseClient) {
  return {
    async userId() {
      const { data } = await db.auth.getSession();
      return data.session?.user.id ?? null;
    },
    async myPage(): Promise<Page | null> {
      const uid = await this.userId();
      if (!uid) return null;
      const { data } = await db.from("pages").select("*").eq("owner", uid).maybeSingle();
      return data ? toPage(data as Row) : null;
    },
    async getPage(handle: string): Promise<Page | null> {
      const { data } = await db.from("pages").select("*").eq("handle", handle).maybeSingle();
      return data ? toPage(data as Row) : null;
    },
    async taken(handle: string) {
      const { count } = await db.from("pages").select("handle", { count: "exact", head: true }).eq("handle", handle);
      return (count ?? 0) > 0;
    },
    async createPage(handle: string, name: string, blocks: Block[]) {
      const uid = await this.userId();
      if (!uid) throw new Error("로그인이 필요해요");
      const { error } = await db.from("pages").insert({ handle, name, owner: uid, blocks });
      if (error) throw new Error(error.code === "23505" ? "이미 사용 중인 아이디입니다" : error.message);
    },
    async savePage(page: Page) {
      const { profile, blocks } = page;
      const { error } = await db
        .from("pages")
        .update({ name: profile.name, bio: profile.bio, avatar_url: profile.avatar ?? null, blocks, updated_at: new Date().toISOString() })
        .eq("handle", profile.handle);
      if (error) throw new Error(error.message);
    },
    async upload(dataUrl: string): Promise<string> {
      const uid = await this.userId();
      if (!uid) throw new Error("로그인이 필요해요");
      const blob = await (await fetch(dataUrl)).blob();
      const path = `${uid}/${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}.jpg`;
      const { error } = await db.storage.from("media").upload(path, blob, { contentType: "image/jpeg" });
      if (error) throw new Error(error.message);
      return db.storage.from("media").getPublicUrl(path).data.publicUrl;
    },
    async events(handle: string, since: number): Promise<KnilEvent[]> {
      // The API returns at most 1,000 rows per request, so page through.
      const out: KnilEvent[] = [];
      for (let from = 0; ; from += 1000) {
        const { data, error } = await db
          .from("events")
          .select("kind, target, source, at")
          .eq("handle", handle)
          .gte("at", new Date(since).toISOString())
          .order("at")
          .range(from, from + 999);
        if (error || !data) break;
        for (const r of data) {
          out.push({ handle, kind: r.kind, target: r.target ?? undefined, source: r.source as Source, at: Date.parse(r.at) });
        }
        if (data.length < 1000) break;
      }
      return out;
    },
    record(e: KnilEvent) {
      void db.from("events").insert({ handle: e.handle, kind: e.kind, target: e.target ?? null, source: e.source });
    },
    // Kept apart from savePage so pages keep saving even before the
    // portfolio column exists (supabase/002_collab.sql).
    async savePortfolio(handle: string, portfolio: Portfolio) {
      const { error } = await db.from("pages").update({ portfolio }).eq("handle", handle);
      if (error) throw new Error(error.message);
    },
    async sendProposal(p: Omit<Proposal, "id" | "status" | "at">) {
      const { error } = await db.from("proposals").insert(p);
      if (error) throw new Error(error.message);
    },
    async proposals(handle: string): Promise<Proposal[]> {
      const { data, error } = await db.from("proposals").select("*").eq("handle", handle).order("created_at", { ascending: false });
      if (error || !data) return [];
      return (data as ProposalRow[]).map((r) => ({ ...r, id: String(r.id), at: Date.parse(r.created_at) }));
    },
    async setProposalStatus(id: string, status: ProposalStatus) {
      const { error } = await db.from("proposals").update({ status }).eq("id", Number(id));
      if (error) throw new Error(error.message);
    },
    async sendLoginLink(email: string, redirectTo: string) {
      const { error } = await db.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
      if (error) throw new Error(error.status === 429 ? "잠시 후 다시 시도해 주세요" : error.message);
    },
    async signOut() {
      await db.auth.signOut();
    },
  };
}
