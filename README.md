# VideoScrub (Boys@Work)

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment file:
   ```bash
   cp .env.example .env
   ```
3. Fill these values in `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - Optional: `VITE_API_URL`

> `SUPABASE_DB_URL` is **server-side only**. Do not expose it to browser code.

## Supabase database table required
Create a `profiles` table (SQL editor in Supabase):

```sql
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text not null,
  phone text,
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles
  for select
  using (auth.uid() = user_id);

create policy "Users can insert/update own profile"
  on public.profiles
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

## Run
```bash
npm run dev
```
