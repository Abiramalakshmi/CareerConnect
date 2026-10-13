-- CareerConnect schema. Run this once in the Supabase SQL Editor.
-- Also create a PRIVATE storage bucket named "resumes" (Storage > New bucket).

create table users (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text unique not null,
  name text not null,
  email text not null,
  role text not null check (role in ('candidate', 'recruiter')),
  phone text,
  location text,
  summary text,
  skills text[],
  education jsonb,
  resume_path text,
  created_at timestamptz default now()
);

create table jobs (
  id uuid primary key default gen_random_uuid(),
  recruiter_id uuid not null references users(id) on delete cascade,
  title text not null,
  company text not null,
  description text not null,
  requirements text,
  location text,
  job_type text check (job_type in ('full-time', 'part-time', 'internship', 'contract')),
  work_mode text check (work_mode in ('on-site', 'remote', 'hybrid')),
  experience_level text check (experience_level in ('fresher', 'entry-level', 'experienced')),
  salary_min integer,
  salary_max integer,
  status text default 'open' check (status in ('open', 'closed')),
  deadline date,
  created_at timestamptz default now()
);

create table applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  candidate_id uuid not null references users(id) on delete cascade,
  resume_path text,
  cover_letter text,
  status text default 'applied' check (status in ('applied', 'under_review', 'shortlisted', 'hired', 'rejected')),
  applied_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (job_id, candidate_id)
);
