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
