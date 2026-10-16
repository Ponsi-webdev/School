-- Sample Secondary School: Supabase schema for the CONNECTED version.
-- STATUS: applied to the Supabase project "sample-school-demo" and the security rules were tested
-- against the real database (37 of 37 checks passed; see docs/TESTING.md). The website itself is NOT yet
-- connected to this database.

create extension if not exists pgcrypto;

-- ---------- staff ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (length(trim(full_name)) between 2 and 80),
  role text not null default 'editor' check (role in ('admin','editor','admissions')),
  created_at timestamptz not null default now()
);

create function public.staff_role() returns text
language sql stable security definer set search_path = '' as $$
  select role from public.profiles where id = (select auth.uid())
$$;
revoke execute on function public.staff_role() from public, anon;
grant execute on function public.staff_role() to authenticated;

-- ---------- content ----------
create table public.site_settings (
  id int primary key default 1 check (id = 1),
  school_name text not null default 'Sample Secondary School',
  tagline text, phone text, email text, address text, hours text,
  social jsonb not null default '{}', footer_note text,
  map_raw text, map_query text, map_type text check (map_type in ('address','coordinates')),
  directions text, brand jsonb, updated_at timestamptz not null default now()
);
insert into public.site_settings (id) values (1) on conflict do nothing;

create table public.page_content (
  key text primary key check (key ~ '^[a-z0-9_-]{2,40}$'),
  data jsonb not null, updated_at timestamptz not null default now()
);

create table public.news (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 80),
  title text not null check (length(title) between 3 and 140),
  summary text not null check (length(summary) between 10 and 300),
  body text not null check (length(body) between 20 and 10000),
  category text not null check (length(category) between 2 and 40),
  cover_path text,
  status text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz not null default now(),
  created_by uuid default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(title) between 3 and 120),
  description text not null check (length(description) between 10 and 600),
  starts_at timestamptz not null, location text not null check (length(location) between 3 and 120),
  status text not null default 'draft' check (status in ('draft','published')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.admissions_items (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('requirement','step','date','faq')),
  title text not null check (length(title) between 2 and 300), body text,
  sort_order int not null default 0, updated_at timestamptz not null default now()
);
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(title) between 3 and 120),
  file_path text, approved boolean not null default false,
  updated_at timestamptz not null default now(),
  check (not approved or file_path is not null)
);
create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  category text not null check (length(category) between 2 and 40),
  caption text not null check (length(caption) between 3 and 120),
  alt_text text not null check (length(alt_text) between 5 and 200),
  image_path text not null,
  status text not null default 'published' check (status in ('draft','published')),
  created_at timestamptz not null default now()
);
create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 2 and 80),
  contact text not null check (length(contact) between 5 and 120),
  topic text not null default 'General' check (topic in ('Admissions','General','Other')),
  message text not null check (length(message) between 10 and 1000),
  status text not null default 'new' check (status in ('new','in_progress','resolved')),
  created_at timestamptz not null default now()
);

create function public.touch_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;
create trigger t_news before update on public.news for each row execute function public.touch_updated_at();
create trigger t_events before update on public.events for each row execute function public.touch_updated_at();

-- ---------- row level security ----------
alter table public.profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.page_content enable row level security;
alter table public.news enable row level security;
alter table public.events enable row level security;
alter table public.admissions_items enable row level security;
alter table public.documents enable row level security;
alter table public.gallery_items enable row level security;
alter table public.enquiries enable row level security;

-- profiles: staff read their own row; only administrators create, change or remove staff (no self-promotion)
create policy "read own profile" on public.profiles for select to authenticated using (id = (select auth.uid()) or public.staff_role() = 'admin');
create policy "admin manages profiles" on public.profiles for all to authenticated using (public.staff_role() = 'admin') with check (public.staff_role() = 'admin');

-- public may read site settings and page content; administrators edit settings; admin and editor edit page content
create policy "public reads settings" on public.site_settings for select to anon, authenticated using (true);
create policy "admin edits settings" on public.site_settings for update to authenticated using (public.staff_role() = 'admin') with check (public.staff_role() = 'admin');
create policy "public reads page content" on public.page_content for select to anon, authenticated using (true);
create policy "staff edit page content" on public.page_content for all to authenticated using (public.staff_role() in ('admin','editor')) with check (public.staff_role() in ('admin','editor'));

-- news and events: the public sees only published items; admin and editor manage everything
create policy "public reads published news" on public.news for select to anon, authenticated using (status = 'published' and published_at <= now());
create policy "staff read all news" on public.news for select to authenticated using (public.staff_role() in ('admin','editor'));
create policy "staff write news" on public.news for all to authenticated using (public.staff_role() in ('admin','editor')) with check (public.staff_role() in ('admin','editor'));
create policy "public reads published events" on public.events for select to anon, authenticated using (status = 'published');
create policy "staff read all events" on public.events for select to authenticated using (public.staff_role() in ('admin','editor'));
create policy "staff write events" on public.events for all to authenticated using (public.staff_role() in ('admin','editor')) with check (public.staff_role() in ('admin','editor'));

-- admissions, documents, gallery
create policy "public reads admissions" on public.admissions_items for select to anon, authenticated using (true);
create policy "staff write admissions" on public.admissions_items for all to authenticated using (public.staff_role() in ('admin','editor')) with check (public.staff_role() in ('admin','editor'));
create policy "public reads approved documents" on public.documents for select to anon, authenticated using (approved);
create policy "staff manage documents" on public.documents for all to authenticated using (public.staff_role() in ('admin','editor')) with check (public.staff_role() in ('admin','editor'));
create policy "public reads published gallery" on public.gallery_items for select to anon, authenticated using (status = 'published');
create policy "staff manage gallery" on public.gallery_items for all to authenticated using (public.staff_role() in ('admin','editor')) with check (public.staff_role() in ('admin','editor'));

-- enquiries: anyone may SUBMIT (new, length-checked); nobody public can read, change or delete; admin and admissions staff read and update
create policy "anyone submits enquiry" on public.enquiries for insert to anon, authenticated with check (status = 'new');
create policy "staff read enquiries" on public.enquiries for select to authenticated using (public.staff_role() in ('admin','admissions'));
create policy "staff update enquiries" on public.enquiries for update to authenticated using (public.staff_role() in ('admin','admissions')) with check (public.staff_role() in ('admin','admissions'));

-- ---------- storage ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('site-media','site-media',true,5242880,array['image/jpeg','image/png','image/webp']),
  ('documents','documents',true,5242880,array['application/pdf'])
on conflict (id) do nothing;
create policy "public reads media" on storage.objects for select to anon, authenticated using (bucket_id = 'site-media');
create policy "staff upload media" on storage.objects for insert to authenticated with check (bucket_id = 'site-media' and public.staff_role() in ('admin','editor'));
create policy "staff change media" on storage.objects for update to authenticated using (bucket_id = 'site-media' and public.staff_role() in ('admin','editor'));
create policy "staff delete media" on storage.objects for delete to authenticated using (bucket_id = 'site-media' and public.staff_role() in ('admin','editor'));
-- only files under approved/ are public; staff keep drafts elsewhere in the bucket
create policy "public reads approved documents" on storage.objects for select to anon, authenticated using (bucket_id = 'documents' and name like 'approved/%');
create policy "staff read all documents" on storage.objects for select to authenticated using (bucket_id = 'documents' and public.staff_role() in ('admin','editor'));
create policy "staff upload documents" on storage.objects for insert to authenticated with check (bucket_id = 'documents' and public.staff_role() in ('admin','editor'));
create policy "staff delete documents" on storage.objects for delete to authenticated using (bucket_id = 'documents' and public.staff_role() in ('admin','editor'));
