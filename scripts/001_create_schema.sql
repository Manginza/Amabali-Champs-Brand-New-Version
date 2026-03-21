-- Amabali Champs Reading Gym Database Schema

-- Profiles table (linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_emoji text default '📚',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Reading sessions table
create table if not exists public.reading_sessions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone,
  is_active boolean default false,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

alter table public.reading_sessions enable row level security;

create policy "sessions_select_all" on public.reading_sessions for select using (true);
create policy "sessions_insert_auth" on public.reading_sessions for insert with check (auth.uid() = created_by);
create policy "sessions_update_own" on public.reading_sessions for update using (auth.uid() = created_by);

-- Book reviews table
create table if not exists public.book_reviews (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.reading_sessions(id) on delete cascade,
  learner_id uuid not null references auth.users(id) on delete cascade,
  learner_name text not null,
  avatar_emoji text default '📚',
  book_title text not null,
  book_author text,
  star_rating integer check (star_rating >= 1 and star_rating <= 5) default 3,
  review_text text not null,
  word_count integer not null default 0,
  earnings_cents integer not null default 0,
  submitted_at timestamp with time zone default now()
);

alter table public.book_reviews enable row level security;

create policy "reviews_select_all" on public.book_reviews for select using (true);
create policy "reviews_insert_own" on public.book_reviews for insert with check (auth.uid() = learner_id);
create policy "reviews_update_own" on public.book_reviews for update using (auth.uid() = learner_id);
create policy "reviews_delete_own" on public.book_reviews for delete using (auth.uid() = learner_id);

-- Indexes for performance
create index if not exists idx_reviews_session_id on public.book_reviews(session_id);
create index if not exists idx_reviews_learner_id on public.book_reviews(learner_id);
create index if not exists idx_reviews_submitted_at on public.book_reviews(submitted_at desc);

-- Leaderboard view for efficient queries
create or replace view public.leaderboard as
select
  r.learner_id,
  r.learner_name,
  r.avatar_emoji,
  r.session_id,
  count(*) as review_count,
  sum(r.word_count) as total_words,
  sum(r.earnings_cents) as total_earnings,
  avg(r.star_rating) as avg_rating
from public.book_reviews r
group by r.learner_id, r.learner_name, r.avatar_emoji, r.session_id;
