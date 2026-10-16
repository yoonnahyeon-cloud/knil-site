// KNIL Edge Function: translated creator pages and visitor chat.
//
// Deploy: Supabase > Edge Functions > Deploy a new function > Via Editor,
// name it `knil`, paste this file, and turn off "Verify JWT" (visitors call
// it without an account). Needs the secret ANTHROPIC_API_KEY.
//
// Actions (POST JSON body):
//   page     { handle, lang }                          -> { dict }
//   send     { handle, lang, name, text, chatId?, token? } -> { chatId, token }
//   history  { chatId, token }                          -> { messages }
//   reply    { chatId, text }   (signed-in page owner)  -> { ok }

import Anthropic from "npm:@anthropic-ai/sdk@0.135.0";
import { createClient } from "npm:@supabase/supabase-js@2.118.0";

const MODEL = "claude-opus-5-5";

const LANGS: Record<string, string> = {
  ko: "Korean",
  en: "English",
  ja: "Japanese",
  "zh-CN": "Simplified Chinese",
  "zh-TW": "Traditional Chinese",
  th: "Thai",
  vi: "Vietnamese",
  id: "Indonesian",
  es: "Spanish",
  fr: "French",
  de: "German",
  pt: "Portuguese",
  ru: "Russian",
};

const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}").default;
const db = createClient(Deno.env.get("SUPABASE_URL")!, serviceKey, { auth: { persistSession: false } });
const anthropic = new Anthropic();

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const body = await req.json();
    switch (body.action) {
      case "page":
        return json(await translatePage(body));
      case "send":
        return json(await send(body));
      case "history":
        return json(await history(body));
      case "reply":
        return json(await reply(req, body));
    }
    throw new HttpError(400, "unknown action");
  } catch (e) {
    if (e instanceof HttpError) return json({ error: e.message }, e.status);
    console.error(e);
    return json({ error: "server error" }, 500);
  }
});

// ---------------------------------------------------------------- pages

type Block = { type: string; hidden?: boolean; [k: string]: unknown };
type PageRow = { handle: string; name: string; bio: string; blocks: Block[]; chat: { on?: boolean; ai?: boolean; guide?: string } | null };

async function loadPage(handle: unknown): Promise<PageRow> {
  if (typeof handle !== "string") throw new HttpError(400, "handle");
  const { data } = await db.from("pages").select("handle, name, bio, blocks, chat").eq("handle", handle).maybeSingle();
  if (!data) throw new HttpError(404, "no such page");
  return data as PageRow;
}

const str = (v: unknown) => (typeof v === "string" ? v : "");
const items = (b: Block) => (Array.isArray(b.items) ? (b.items as Record<string, unknown>[]) : []);

// Same list, same order as pageStrings() in src/lib/i18n.ts.
function pageStrings(page: PageRow): string[] {
  const out: string[] = [page.bio];
  for (const b of page.blocks ?? []) {
    if (b.hidden) continue;
    if (b.type === "link") out.push(str(b.title), str(b.sub), str(b.label));
    if (b.type === "video") out.push(str(b.heading), str(b.title), str(b.meta));
    if (b.type === "gallery") out.push(str(b.title), str(b.note), ...items(b).map((i) => str(i.label)));
    if (b.type === "products") out.push(str(b.title), str(b.note), ...items(b).map((i) => str(i.name)));
    if (b.type === "calendar") out.push(str(b.title), str(b.note), ...items(b).map((i) => str(i.title)), ...items(b).map((i) => str(i.kind)));
    if (b.type === "booking") out.push(str(b.title), str(b.note), ...items(b).flatMap((i) => [str(i.name), str(i.price), str(i.duration)]));
    if (b.type === "place") out.push(str(b.title), str(b.address), str(b.hours));
  }
  return [...new Set(out.map((s) => s.trim()).filter((s) => s && /\p{L}/u.test(s)))].slice(0, 200);
}

async function sha256(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function langName(lang: unknown): string {
  if (typeof lang !== "string" || !LANGS[lang]) throw new HttpError(400, "lang");
  return LANGS[lang];
}

async function translatePage({ handle, lang }: { handle: unknown; lang: unknown }) {
  const target = langName(lang);
  if (lang === "ko") return { dict: {} };
  const page = await loadPage(handle);
  const strings = pageStrings(page);
  const hash = await sha256(JSON.stringify(strings));
  const { data: cached } = await db.from("translations").select("hash, dict").eq("handle", page.handle).eq("lang", lang).maybeSingle();
  if (cached?.hash === hash) return { dict: cached.dict };
  if (!strings.length) return { dict: {} };

  const out = await ask<{ items: string[] }>(
    `You translate the text of a link-in-bio page (a creator's, or a brand's or clinic's) into ${target}. The text is mostly Korean, sometimes mixed with English.
Return exactly one translation per input string, in the same order.
Keep brand names, product model numbers, people's names, @handles, prices, phone numbers and emoji as they are. Write Korean street addresses in the usual form for ${target} readers.
Use short, natural wording that reads well on a phone. If a string is already ${target}, return it unchanged.`,
    JSON.stringify(strings),
    { type: "object", properties: { items: { type: "array", items: { type: "string" } } }, required: ["items"], additionalProperties: false },
  );
  const dict: Record<string, string> = {};
  strings.forEach((s, i) => {
    if (out.items[i]) dict[s] = out.items[i];
  });
  await db.from("translations").upsert({ handle: page.handle, lang, hash, dict });
  return { dict };
}

// ----------------------------------------------------------------- chat

type Msg = { sender: "visitor" | "owner" | "ai"; text_ko: string; text_visitor: string; at: string };

async function chatFor(chatId: unknown, token: unknown) {
  if (typeof chatId !== "string" || typeof token !== "string") throw new HttpError(400, "chat");
  const { data } = await db.from("chats").select("*").eq("id", chatId).maybeSingle();
  if (!data || data.token_hash !== (await sha256(token))) throw new HttpError(403, "not your chat");
  return data;
}

async function recent(chatId: string, limit: number): Promise<Msg[]> {
  const { data } = await db.from("messages").select("sender, text_ko, text_visitor, at").eq("chat_id", chatId).order("at", { ascending: false }).limit(limit);
  return ((data ?? []) as Msg[]).reverse();
}

function pageInfo(page: PageRow) {
  const lines = [`Bio: ${page.bio}`];
  for (const b of page.blocks ?? []) {
    if (b.hidden) continue;
    if (b.type === "link") lines.push(`Link: ${str(b.title)} — ${str(b.sub)}`);
    if (b.type === "video") lines.push(`Latest video: ${str(b.title)}`);
    if (b.type === "gallery") lines.push(`${str(b.title)}: ${items(b).map((i) => str(i.label)).join(", ")}`);
    if (b.type === "products") lines.push(`${str(b.title)}: ${items(b).map((i) => `${str(i.name)} ${str(i.price)}`).join(", ")}`);
    if (b.type === "calendar") lines.push(`${str(b.title)}: ${items(b).map((i) => `${str(i.kind)} ${str(i.title)} ${str(i.start)}${i.end ? `~${str(i.end)}` : ""}`).join(", ")}`);
    if (b.type === "channels") lines.push(`Channels: ${items(b).map((i) => `${str(i.platform)} ${str(i.followers)}`).join(", ")}`);
    if (b.type === "booking") lines.push(`Bookable (visitors send requests with the "${str(b.title)}" button): ${items(b).map((i) => `${str(i.name)} ${str(i.duration)} ${str(i.price)}`).join(", ")}`);
    if (b.type === "place") lines.push(`Address: ${str(b.address)}; hours: ${str(b.hours).replace(/\n/g, ", ")}; phone: ${str(b.phone)}`);
  }
  return lines.join("\n").slice(0, 3000);
}

async function send(body: { handle: unknown; lang: unknown; name: unknown; text: unknown; chatId?: unknown; token?: unknown }) {
  const target = langName(body.lang);
  const text = str(body.text).trim();
  const name = str(body.name).trim().slice(0, 40);
  if (!text || text.length > 1000) throw new HttpError(400, "text");
  const page = await loadPage(body.handle);
  if (!page.chat?.on) throw new HttpError(403, "chat is off");

  let chat;
  let token: string | undefined;
  if (body.chatId) {
    chat = await chatFor(body.chatId, body.token);
    if (chat.handle !== page.handle) throw new HttpError(403, "not your chat");
    const { count } = await db
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("chat_id", chat.id)
      .eq("sender", "visitor")
      .gte("at", new Date(Date.now() - 86400000).toISOString());
    if ((count ?? 0) >= 60) throw new HttpError(429, "too many messages");
  } else {
    const { count } = await db
      .from("chats")
      .select("id", { count: "exact", head: true })
      .eq("handle", page.handle)
      .gte("created_at", new Date(Date.now() - 3600000).toISOString());
    if ((count ?? 0) >= 100) throw new HttpError(429, "too many chats");
    token = crypto.randomUUID();
    const { data, error } = await db
      .from("chats")
      .insert({ handle: page.handle, token_hash: await sha256(token), lang: body.lang, name })
      .select("*")
      .single();
    if (error) throw error;
    chat = data;
  }

  const useAi = page.chat.ai !== false;
  let ko = text;
  let answer: { visitor: string; ko: string } | null = null;

  if (useAi || body.lang !== "ko") {
    const past = (await recent(chat.id, 12)).map((m) => `${m.sender === "visitor" ? "Visitor" : page.name}: ${m.sender === "visitor" ? m.text_visitor : m.text_ko}`);
    const schema = useAi
      ? { type: "object", properties: { text_ko: { type: "string" }, reply: { type: "string" }, reply_ko: { type: "string" } }, required: ["text_ko", "reply", "reply_ko"], additionalProperties: false }
      : { type: "object", properties: { text_ko: { type: "string" } }, required: ["text_ko"], additionalProperties: false };
    const system = useAi
      ? `You answer messages that visitors send to ${page.name} (@${page.handle}) through their KNIL page, a link-in-bio page. The visitor writes in ${target}; ${page.name} reads Korean.

About ${page.name}'s page:
${pageInfo(page)}

${page.name}'s notes for answering:
${(page.chat.guide ?? "").slice(0, 2000) || "(none)"}

Answer only from the page and the notes. Keep it to one to three friendly sentences in ${target}. When the question needs ${page.name} personally (deals, schedules, anything the page and notes do not cover), say that ${page.name} will read the message and reply here. Never invent prices, stock, dates or promises, and never give medical or legal judgements.

Return text_ko: the visitor's latest message in natural Korean; reply: your answer in ${target}; reply_ko: the same answer in Korean.`
      : `Translate the visitor's latest message into natural Korean for ${page.name}, keeping names, brands and emoji. Return it as text_ko.`;
    const user = `${past.length ? `Earlier messages:\n${past.join("\n")}\n\n` : ""}Visitor's latest message:\n${text}`;
    const out = await ask<{ text_ko: string; reply?: string; reply_ko?: string }>(system, user, schema);
    ko = out.text_ko || text;
    if (useAi && out.reply) answer = { visitor: out.reply, ko: out.reply_ko || out.reply };
  }

  const rows = [{ chat_id: chat.id, sender: "visitor", text_ko: ko, text_visitor: text }];
  if (answer) rows.push({ chat_id: chat.id, sender: "ai", text_ko: answer.ko, text_visitor: answer.visitor });
  for (const r of rows) {
    const { error } = await db.from("messages").insert(r);
    if (error) throw error;
  }
  await db
    .from("chats")
    .update({ last_text: answer?.ko ?? ko, unread: chat.unread + 1, updated_at: new Date().toISOString(), ...(name && !chat.name ? { name } : {}) })
    .eq("id", chat.id);
  return { chatId: chat.id, token: token ?? body.token };
}

async function history({ chatId, token }: { chatId: unknown; token: unknown }) {
  const chat = await chatFor(chatId, token);
  const { data } = await db.from("messages").select("id, sender, text_visitor, at").eq("chat_id", chat.id).order("at").limit(300);
  return { messages: (data ?? []).map((m) => ({ id: String(m.id), from: m.sender, visitor: m.text_visitor, ko: "", at: Date.parse(m.at) })) };
}

async function reply(req: Request, { chatId, text }: { chatId: unknown; text: unknown }) {
  const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer /, "");
  const { data: auth } = await db.auth.getUser(jwt);
  if (!auth.user) throw new HttpError(401, "sign in");
  const body = str(text).trim();
  if (!body || body.length > 1000 || typeof chatId !== "string") throw new HttpError(400, "text");
  const { data: chat } = await db.from("chats").select("id, handle, lang").eq("id", chatId).maybeSingle();
  if (!chat) throw new HttpError(404, "chat");
  const { data: page } = await db.from("pages").select("owner").eq("handle", chat.handle).maybeSingle();
  if (page?.owner !== auth.user.id) throw new HttpError(403, "not your page");

  let visitor = body;
  if (chat.lang !== "ko") {
    const out = await ask<{ text: string }>(
      `Translate the creator's Korean message into ${langName(chat.lang)} for a fan or customer. Keep the tone, names, brands, prices and emoji. Return it as text.`,
      body,
      { type: "object", properties: { text: { type: "string" } }, required: ["text"], additionalProperties: false },
    );
    visitor = out.text || body;
  }
  const { error } = await db.from("messages").insert({ chat_id: chat.id, sender: "owner", text_ko: body, text_visitor: visitor });
  if (error) throw error;
  await db.from("chats").update({ last_text: body, updated_at: new Date().toISOString() }).eq("id", chat.id);
  return { ok: true };
}

// --------------------------------------------------------------- claude

async function ask<T>(system: string, user: string, schema: Record<string, unknown>): Promise<T> {
  const res = await anthropic.beta.messages.create({
    model: MODEL,
    max_tokens: 4000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low", format: { type: "json_schema", schema } },
    system,
    messages: [{ role: "user", content: user }],
  });
  if (res.stop_reason === "refusal") throw new HttpError(422, "declined");
  const block = res.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") throw new Error("no text in response");
  return JSON.parse(block.text) as T;
}
