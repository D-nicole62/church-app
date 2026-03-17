-- Supabase schema for church visitor app

-- visitors
create table if not exists public.visitors (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  service_time text,
  attending_with_children boolean default false,
  number_of_children integer,
  how_did_you_hear text,
  notes text
);

-- events
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  is_featured boolean not null default false
);

-- sermons
create table if not exists public.sermons (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  speaker text,
  series text,
  "date" date not null,
  description text,
  youtube_url text,
  audio_url text
);

-- groups (small groups / ministries)
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  description text,
  meets_when text,
  location text,
  contact_name text,
  contact_email text
);

