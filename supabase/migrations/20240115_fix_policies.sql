-- Drop all existing policies
drop policy if exists "Enable read access for authenticated users" on public.groups;
drop policy if exists "Enable write access for admins" on public.groups;
drop policy if exists "Enable read access for admins" on public.audit_logs;
drop policy if exists "Enable insert for authenticated users" on public.audit_logs;

-- Add more permissive policies for groups
create policy "Enable read access for all"
on public.groups
for select
to authenticated
using (true);

create policy "Enable insert for all"
on public.groups
for insert
to authenticated
with check (true);

create policy "Enable update for all"
on public.groups
for update
to authenticated
using (true)
with check (true);

create policy "Enable delete for all"
on public.groups
for delete
to authenticated
using (true);

-- Add permissive policies for audit_logs
create policy "Enable all operations for authenticated users"
on public.audit_logs
for all
to authenticated
using (true)
with check (true);
