-- Create analytics_events table
create table if not exists public.analytics_events (
    id uuid default gen_random_uuid() primary key,
    event_name text not null,
    properties jsonb,
    user_id uuid references auth.users(id),
    timestamp timestamptz not null default now(),
    created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.analytics_events enable row level security;

-- Create policies
create policy "Enable insert access for authenticated users" on public.analytics_events
    for insert to authenticated
    with check (true);

create policy "Enable read access for authenticated users" on public.analytics_events
    for select to authenticated
    using (auth.uid() = user_id);

-- Create indexes
create index if not exists analytics_events_user_id_idx on public.analytics_events(user_id);
create index if not exists analytics_events_event_name_idx on public.analytics_events(event_name);
create index if not exists analytics_events_timestamp_idx on public.analytics_events(timestamp);

-- Add function to clean up old events
create or replace function public.cleanup_old_analytics_events()
returns void
language plpgsql
security definer
as $$
begin
    delete from public.analytics_events
    where timestamp < now() - interval '90 days';
end;
$$;

-- Create a scheduled job to clean up old events (runs daily)
select
    cron.schedule(
        'cleanup-old-analytics-events',
        '0 0 * * *', -- Run at midnight every day
        $$
        select public.cleanup_old_analytics_events();
        $$
    );
