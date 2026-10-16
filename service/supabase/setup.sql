-- KNIL: everything the service needs, in one go.
-- Supabase > SQL Editor > paste all of this > Run. Safe to run again: it only
-- adds what is missing. (Same as schema.sql + 002_collab.sql + 003_chat.sql.)

-- KNIL service schema. Paste into Supabase > SQL Editor and run once.
-- Assumes "Automatically expose new tables" is off and RLS is on, so every
-- grant and policy is spelled out here.

create table if not exists public.pages (
  handle      text primary key check (handle ~ '^[a-z0-9._]{3,20}$'),
  owner       uuid not null unique references auth.users (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 30),
  bio         text not null default '',
  avatar_url  text,
  blocks      jsonb not null default '[]'::jsonb,
  updated_at  timestamptz not null default now()
);

create table if not exists public.events (
  id      bigint generated always as identity primary key,
  handle  text not null references public.pages (handle) on delete cascade on update cascade,
  kind    text not null check (kind in ('view', 'click')),
  target  text check (char_length(target) <= 64),
  source  text not null check (char_length(source) <= 16),
  at      timestamptz not null default now()
);
create index if not exists events_handle_at on public.events (handle, at desc);

alter table public.pages enable row level security;
alter table public.events enable row level security;

-- Creator pages are public; only the owner can change theirs.
grant select on public.pages to anon, authenticated;
grant insert, update, delete on public.pages to authenticated;
drop policy if exists "pages are public" on public.pages;
create policy "pages are public" on public.pages for select using (true);
drop policy if exists "owner inserts" on public.pages;
create policy "owner inserts" on public.pages for insert to authenticated with check (owner = auth.uid());
drop policy if exists "owner updates" on public.pages;
create policy "owner updates" on public.pages for update to authenticated using (owner = auth.uid()) with check (owner = auth.uid());
drop policy if exists "owner deletes" on public.pages;
create policy "owner deletes" on public.pages for delete to authenticated using (owner = auth.uid());

-- Anyone visiting a page can log a view or click; only the owner reads them.
grant insert on public.events to anon, authenticated;
grant select on public.events to authenticated;
drop policy if exists "visitors log events" on public.events;
create policy "visitors log events" on public.events for insert to anon, authenticated with check (at > now() - interval '1 minute');
drop policy if exists "owner reads events" on public.events;
create policy "owner reads events" on public.events for select to authenticated
  using (exists (select 1 from public.pages p where p.handle = events.handle and p.owner = auth.uid()));

-- Profile photos and block images.
insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict do nothing;
drop policy if exists "media is public" on storage.objects;
create policy "media is public" on storage.objects for select using (bucket_id = 'media');
drop policy if exists "owner uploads media" on storage.objects;
create policy "owner uploads media" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "owner deletes media" on storage.objects;
create policy "owner deletes media" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);


-- Collaboration: creator portfolio and brand proposals.
-- Run once in Supabase > SQL Editor after schema.sql.

alter table public.pages add column if not exists portfolio jsonb not null default '{}'::jsonb;
-- Page look: cover photo and accent color.
alter table public.pages add column if not exists look jsonb not null default '{}'::jsonb;

create table if not exists public.proposals (
  id          bigint generated always as identity primary key,
  handle      text not null references public.pages (handle) on delete cascade on update cascade,
  brand       text not null check (char_length(brand) between 1 and 60),
  contact     text not null check (char_length(contact) between 3 and 120),
  budget      text not null default '' check (char_length(budget) <= 40),
  message     text not null check (char_length(message) between 1 and 2000),
  status      text not null default 'new' check (status in ('new', 'progress', 'done')),
  created_at  timestamptz not null default now()
);
create index if not exists proposals_handle on public.proposals (handle, created_at desc);
alter table public.proposals enable row level security;

-- Any visitor (a brand) can send a proposal; only the page owner reads and
-- updates them.
grant insert on public.proposals to anon, authenticated;
grant select, update on public.proposals to authenticated;
drop policy if exists "brands send proposals" on public.proposals;
create policy "brands send proposals" on public.proposals for insert to anon, authenticated with check (status = 'new');
drop policy if exists "owner reads proposals" on public.proposals;
create policy "owner reads proposals" on public.proposals for select to authenticated
  using (exists (select 1 from public.pages p where p.handle = proposals.handle and p.owner = auth.uid()));
drop policy if exists "owner updates proposals" on public.proposals;
create policy "owner updates proposals" on public.proposals for update to authenticated
  using (exists (select 1 from public.pages p where p.handle = proposals.handle and p.owner = auth.uid()));


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
drop policy if exists "owner reads chats" on public.chats;
create policy "owner reads chats" on public.chats for select to authenticated
  using (exists (select 1 from public.pages p where p.handle = chats.handle and p.owner = auth.uid()));
drop policy if exists "owner marks chats read" on public.chats;
create policy "owner marks chats read" on public.chats for update to authenticated
  using (exists (select 1 from public.pages p where p.handle = chats.handle and p.owner = auth.uid()));
drop policy if exists "owner reads messages" on public.messages;
create policy "owner reads messages" on public.messages for select to authenticated
  using (exists (select 1 from public.chats c join public.pages p on p.handle = c.handle where c.id = messages.chat_id and p.owner = auth.uid()));

-- The Edge Function works with the service role.
grant select on public.pages to service_role;
grant select, insert, update, delete on public.chats, public.messages, public.translations to service_role;


-- Make the API see the new tables right away.
notify pgrst, 'reload schema';
