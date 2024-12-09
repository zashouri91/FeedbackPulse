-- Create groups table if it doesn't exist
create table if not exists public.groups (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    manager_id uuid references auth.users(id),
    location_id uuid references public.locations(id),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create audit_logs table if it doesn't exist
create table if not exists public.audit_logs (
    id uuid default gen_random_uuid() primary key,
    table_name text not null,
    record_id uuid not null,
    operation text not null,
    old_data jsonb,
    new_data jsonb,
    user_id uuid not null,
    user_email text,
    user_role text,
    created_at timestamptz default now()
);

-- Add indexes for better query performance
create index if not exists groups_manager_id_idx on public.groups(manager_id);
create index if not exists groups_location_id_idx on public.groups(location_id);
create index if not exists audit_logs_table_record_idx on public.audit_logs(table_name, record_id);
create index if not exists audit_logs_user_id_idx on public.audit_logs(user_id);

-- Enable RLS on tables
alter table public.groups enable row level security;
alter table public.audit_logs enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Enable read access for authenticated users" on public.groups;
drop policy if exists "Enable write access for admins" on public.groups;
drop policy if exists "Enable read access for admins" on public.audit_logs;
drop policy if exists "Enable insert for authenticated users" on public.audit_logs;

-- Add RLS policies for groups
create policy "Enable read access for authenticated users"
on public.groups
for select
using (auth.role() = 'authenticated');

create policy "Enable write access for admins"
on public.groups
for all
using (
    auth.jwt() ->> 'role' in ('admin', 'super_admin')
)
with check (
    auth.jwt() ->> 'role' in ('admin', 'super_admin')
);

-- Add RLS policies for audit_logs
create policy "Enable read access for admins"
on public.audit_logs
for select
using (
    auth.jwt() ->> 'role' in ('admin', 'super_admin')
);

create policy "Enable insert for authenticated users"
on public.audit_logs
for insert
with check (auth.role() = 'authenticated');
