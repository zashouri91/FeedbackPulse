-- Check users
SELECT 
    id, 
    email, 
    role, 
    groups,
    location_id,
    first_name,
    last_name
FROM public.users;

-- Check groups
SELECT 
    id,
    name,
    manager_id,
    location_id,
    created_at,
    updated_at
FROM public.groups;

-- Check locations
SELECT 
    id,
    name,
    managers,
    created_at
FROM public.locations;

-- Check current auth user
SELECT 
    id,
    email,
    raw_user_meta_data
FROM auth.users
WHERE id = auth.uid();
