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
