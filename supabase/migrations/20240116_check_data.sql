-- Check if current user exists in auth.users
SELECT 
    id,
    email,
    raw_app_meta_data,
    raw_user_meta_data
FROM auth.users 
WHERE id = auth.uid();

-- Check if current user exists in public.users and their role
SELECT 
    id,
    email,
    role,
    groups,
    location_id
FROM public.users
WHERE id = auth.uid();

-- List all groups and their managers
SELECT 
    g.id,
    g.name,
    g.manager_id,
    g.location_id,
    u.email as manager_email,
    u.role as manager_role
FROM public.groups g
LEFT JOIN public.users u ON g.manager_id = u.id;

-- List all locations
SELECT * FROM public.locations;

-- Check RLS policies on groups table
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'groups';
