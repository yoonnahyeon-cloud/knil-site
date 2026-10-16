-- Collaboration: creator portfolio and brand proposals.
-- Run once in Supabase > SQL Editor after schema.sql.

alter table public.pages add column if not exists portfolio jsonb not null default '{}'::jsonb;

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
create policy "brands send proposals" on public.proposals for insert to anon, authenticated with check (status = 'new');
create policy "owner reads proposals" on public.proposals for select to authenticated
  using (exists (select 1 from public.pages p where p.handle = proposals.handle and p.owner = auth.uid()));
create policy "owner updates proposals" on public.proposals for update to authenticated
  using (exists (select 1 from public.pages p where p.handle = proposals.handle and p.owner = auth.uid()));
