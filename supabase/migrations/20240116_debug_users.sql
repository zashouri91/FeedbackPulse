-- Check users and their groups
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.groups,
    u.location_id,
    u.role
FROM public.users u
WHERE EXISTS (
    SELECT 1 FROM auth.users au 
    WHERE au.id = u.id 
    AND au.deleted_at IS NULL
);

-- Let's also create a function that's more lenient for debugging
CREATE OR REPLACE FUNCTION get_assignable_users_debug(
    p_group_id uuid,
    p_location_id uuid
)
RETURNS TABLE (
    id uuid,
    email text,
    first_name text,
    last_name text,
    role text,
    location_id uuid,
    groups uuid[],
    matches_group boolean,
    matches_location boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.role,
        u.location_id,
        u.groups,
        p_group_id = ANY(u.groups) as matches_group,
        (u.location_id = p_location_id OR u.location_id IS NULL) as matches_location
    FROM public.users u
    WHERE EXISTS (
        SELECT 1 FROM auth.users au 
        WHERE au.id = u.id 
        AND au.deleted_at IS NULL
    )
    ORDER BY 
        COALESCE(u.first_name, '') || ' ' || COALESCE(u.last_name, ''),
        u.email;
END;
$$;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION get_assignable_users_debug TO authenticated;
