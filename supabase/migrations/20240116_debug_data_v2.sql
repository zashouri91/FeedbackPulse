-- Check current auth user first
SELECT 
    id,
    email,
    raw_user_meta_data
FROM auth.users
WHERE id = auth.uid();

-- Check users
SELECT 
    id, 
    email, 
    role, 
    groups,
    location_id,
    first_name,
    last_name,
    created_at
FROM public.users;

-- Check groups
SELECT 
    id,
    name,
    manager_id,
    location_id,
    created_at
FROM public.groups;

-- Check locations
SELECT 
    id,
    name,
    managers,
    created_at
FROM public.locations;

-- Check if current user exists in public.users
SELECT EXISTS (
    SELECT 1 
    FROM public.users 
    WHERE id = auth.uid()
) as user_exists_in_public;

-- Check current user's role in JWT
SELECT auth.jwt() ->> 'role' as current_user_role;
