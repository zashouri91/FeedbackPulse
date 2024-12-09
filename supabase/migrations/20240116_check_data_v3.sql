-- Check groups
SELECT id, name, manager_id, location_id
FROM public.groups;

-- Check locations
SELECT id, name, managers
FROM public.locations;

-- Check assignable users
SELECT id, email, role, groups, location_id
FROM public.users
WHERE role != 'super_admin';
