-- ═══════════════════════════════════════════════════════════════
-- Bungalooo — настройка на базата (Supabase)
--
-- Как се използва:
--   Supabase конзола → вашия проект → „SQL Editor" → „New query" →
--   поставете ЦЯЛОТО съдържание на този файл → „Run".
--
-- Прави три неща:
--   1. Създава таблицата „bungalows".
--   2. Включва правила за достъп (RLS): всеки чете, само влезлият
--      редактор пише.
--   3. Включва синхронизация в реално време.
-- ═══════════════════════════════════════════════════════════════

-- 1) Таблица (един ред = едно бунгало; всички полета са в „doc")
create table if not exists public.bungalows (
  id uuid primary key,
  doc jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 2) Правила за достъп
alter table public.bungalows enable row level security;

-- всеки може да ЧЕТЕ (публичен режим)
drop policy if exists "bungalows_read_all" on public.bungalows;
create policy "bungalows_read_all"
  on public.bungalows for select
  to anon, authenticated
  using (true);

-- само ВЛЕЗЛИЯТ редактор може да добавя / променя / трие
drop policy if exists "bungalows_write_auth" on public.bungalows;
create policy "bungalows_write_auth"
  on public.bungalows for all
  to authenticated
  using (true)
  with check (true);

-- 3) Синхронизация в реално време
alter publication supabase_realtime add table public.bungalows;
