-- KNIL service schema. Paste into Supabase > SQL Editor and run once.
-- Assumes "Automatically expose new tables" is off and RLS is on, so every
-- grant and policy is spelled out here.

create table public.pages (
  handle      text primary key check (handle ~ '^[a-z0-9._]{3,20}$'),
  owner       uuid not null unique references auth.users (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 30),
  bio         text not null default '',
  avatar_url  text,
  blocks      jsonb not null default '[]'::jsonb,
  updated_at  timestamptz not null default now()
);

create table public.events (
  id      bigint generated always as identity primary key,
  handle  text not null references public.pages (handle) on delete cascade on update cascade,
  kind    text not null check (kind in ('view', 'click')),
  target  text check (char_length(target) <= 64),
  source  text not null check (char_length(source) <= 16),
  at      timestamptz not null default now()
);
create index events_handle_at on public.events (handle, at desc);

alter table public.pages enable row level security;
alter table public.events enable row level security;

-- Creator pages are public; only the owner can change theirs.
grant select on public.pages to anon, authenticated;
grant insert, update, delete on public.pages to authenticated;
create policy "pages are public" on public.pages for select using (true);
create policy "owner inserts" on public.pages for insert to authenticated with check (owner = auth.uid());
create policy "owner updates" on public.pages for update to authenticated using (owner = auth.uid()) with check (owner = auth.uid());
create policy "owner deletes" on public.pages for delete to authenticated using (owner = auth.uid());

-- Anyone visiting a page can log a view or click; only the owner reads them.
grant insert on public.events to anon, authenticated;
grant select on public.events to authenticated;
create policy "visitors log events" on public.events for insert to anon, authenticated with check (at > now() - interval '1 minute');
create policy "owner reads events" on public.events for select to authenticated
  using (exists (select 1 from public.pages p where p.handle = events.handle and p.owner = auth.uid()));

-- Profile photos and block images.
insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict do nothing;
create policy "media is public" on storage.objects for select using (bucket_id = 'media');
create policy "owner uploads media" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "owner deletes media" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
