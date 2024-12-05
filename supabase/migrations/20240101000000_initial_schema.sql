-- Enable RLS
alter table auth.users enable row level security;

-- Create tables
create table public.locations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  managers uuid[] not null default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.groups (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  manager_id uuid references auth.users(id) on delete set null,
  location_id uuid references public.locations(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null unique,
  role text not null default 'user',
  groups uuid[] not null default '{}',
  location_id uuid references public.locations(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint valid_role check (role in ('super_admin', 'admin', 'manager', 'user'))
);

create table public.surveys (
  id uuid default gen_random_uuid() primary key,
  creator_id uuid references auth.users(id) on delete set null not null,
  assignee_id uuid references auth.users(id) on delete cascade not null,
  group_id uuid references public.groups(id) on delete cascade not null,
  location_id uuid references public.locations(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.responses (
  id uuid default gen_random_uuid() primary key,
  survey_id uuid references public.surveys(id) on delete cascade not null,
  rating integer not null,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint valid_rating check (rating between 1 and 5)
);

create table public.templates (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  questions jsonb not null default '[]',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  message text not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  read boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  action text not null,
  user_id uuid not null,
  user_email text not null,
  user_role text not null,
  details jsonb not null default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index locations_name_idx on public.locations (name);
create index groups_name_idx on public.groups (name);
create index groups_location_id_idx on public.groups (location_id);
create index users_email_idx on public.users (email);
create index users_role_idx on public.users (role);
create index surveys_creator_id_idx on public.surveys (creator_id);
create index surveys_assignee_id_idx on public.surveys (assignee_id);
create index surveys_group_id_idx on public.surveys (group_id);
create index surveys_location_id_idx on public.surveys (location_id);
create index responses_survey_id_idx on public.responses (survey_id);
create index templates_name_idx on public.templates (name);
create index notifications_user_id_idx on public.notifications (user_id);
create index notifications_read_idx on public.notifications (read);
create index audit_logs_action_idx on public.audit_logs (action);
create index audit_logs_user_id_idx on public.audit_logs (user_id);
create index audit_logs_created_at_idx on public.audit_logs (created_at);

-- Enable RLS policies
alter table public.locations enable row level security;
alter table public.groups enable row level security;
alter table public.users enable row level security;
alter table public.surveys enable row level security;
alter table public.responses enable row level security;
alter table public.templates enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

-- Create RLS policies
create policy "Public read access"
  on public.locations for select
  using (true);

create policy "Admins can manage locations"
  on public.locations for all
  using (auth.jwt() ->> 'role' in ('admin', 'super_admin'));

-- Similar policies for other tables...