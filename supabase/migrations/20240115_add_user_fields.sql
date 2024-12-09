-- Add new columns to users table
alter table public.users 
add column if not exists first_name text,
add column if not exists last_name text,
add column if not exists phone_number text;
