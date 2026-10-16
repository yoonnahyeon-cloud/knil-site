-- Chat with visitors in their own language, and translated pages.
-- Run once in Supabase > SQL Editor after 002_collab.sql.
-- Visitors never touch these tables directly: the `knil` Edge Function
-- (supabase/functions/knil) checks their chat token and writes for them.

alter table public.pages add column if not exists chat jsonb not null default '{}'::jsonb;

create table if not exists public.chats (
  id          uuid primary key default gen_random_uuid(),
  handle      text not null references public.pages (handle) on delete cascade on update cascade,
  token_hash  text not null,
  lang        text not null check (char_length(lang) <= 8),
  name        text not null default '' check (char_length(name) <= 40),
  last_text   text not null default '',
  unread      int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists chats_handle on public.chats (handle, updated_at desc);

create table if not exists public.messages (
  id            bigint generated always as identity primary key,
  chat_id       uuid not null references public.chats (id) on delete cascade,
  sender        text not null check (sender in ('visitor', 'owner', 'ai')),
  text_ko       text not null check (char_length(text_ko) <= 4000),
  text_visitor  text not null check (char_length(text_visitor) <= 4000),
  at            timestamptz not null default now()
);
create index if not exists messages_chat on public.messages (chat_id, at);

-- One cached translation per page and language; `hash` says which version
-- of the page it was made from.
create table if not exists public.translations (
  handle  text not null references public.pages (handle) on delete cascade on update cascade,
  lang    text not null,
  hash    text not null,
  dict    jsonb not null,
  primary key (handle, lang)
);

alter table public.chats enable row level security;
alter table public.messages enable row level security;
alter table public.translations enable row level security;

-- The page owner reads their chats and clears the unread count.
grant select, update (unread) on public.chats to authenticated;
grant select on public.messages to authenticated;
create policy "owner reads chats" on public.chats for select to authenticated
  using (exists (select 1 from public.pages p where p.handle = chats.handle and p.owner = auth.uid()));
create policy "owner marks chats read" on public.chats for update to authenticated
  using (exists (select 1 from public.pages p where p.handle = chats.handle and p.owner = auth.uid()));
create policy "owner reads messages" on public.messages for select to authenticated
  using (exists (select 1 from public.chats c join public.pages p on p.handle = c.handle where c.id = messages.chat_id and p.owner = auth.uid()));

-- The Edge Function works with the service role.
grant select on public.pages to service_role;
grant select, insert, update, delete on public.chats, public.messages, public.translations to service_role;
