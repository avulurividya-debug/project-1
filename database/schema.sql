-- CampusPath database schema
-- Backend uses the Supabase service-role key only on the server and enforces API authorization.
-- RLS is enabled with no anon/authenticated policies: direct client access is denied by default.
create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 100),
  email text not null unique check (email = lower(email)),
  password_hash text not null,
  role text not null default 'student' check (role in ('student','admin')),
  department text not null default '',
  graduation_year integer check (graduation_year is null or graduation_year between 2020 and 2100),
  skills text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(trim(name)) between 1 and 120),
  website text,
  industry text,
  description text,
  contact_email text,
  created_at timestamptz not null default now()
);

create table if not exists public.drives (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete set null,
  title text not null check (char_length(trim(title)) between 1 and 150),
  description text not null default '',
  role_type text not null check (role_type in ('Placement','Internship')),
  location text not null default 'Not specified',
  eligibility text not null default '',
  deadline date not null,
  status text not null default 'Open' check (status in ('Open','Closed')),
  package_lpa numeric(8,2) check (package_lpa is null or package_lpa >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.users(id) on delete cascade,
  drive_id uuid not null references public.drives(id) on delete cascade,
  cover_note text,
  status text not null default 'Submitted' check (status in ('Submitted','Under Review','Shortlisted','Rejected','Selected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(student_id, drive_id)
);

create index if not exists idx_users_role on public.users(role);
create index if not exists idx_drives_status_deadline on public.drives(status, deadline);
create index if not exists idx_drives_company_id on public.drives(company_id);
create index if not exists idx_applications_student_id on public.applications(student_id);
create index if not exists idx_applications_drive_id on public.applications(drive_id);
create index if not exists idx_applications_status on public.applications(status);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at before update on public.users for each row execute function public.set_updated_at();
drop trigger if exists drives_set_updated_at on public.drives;
create trigger drives_set_updated_at before update on public.drives for each row execute function public.set_updated_at();
drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at before update on public.applications for each row execute function public.set_updated_at();

alter table public.users enable row level security;
alter table public.companies enable row level security;
alter table public.drives enable row level security;
alter table public.applications enable row level security;

-- Intentionally no policies for anon/authenticated roles. All access goes through the Express API.
-- The service-role key bypasses RLS and MUST remain private in backend/.env.
