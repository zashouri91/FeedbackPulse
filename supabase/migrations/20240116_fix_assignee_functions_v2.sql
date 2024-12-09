-- Drop existing functions
DROP FUNCTION IF EXISTS get_assignable_users(uuid, uuid);
DROP FUNCTION IF EXISTS get_assignable_users_debug(uuid, uuid);

-- Updated function to include both group members and group managers
CREATE OR REPLACE FUNCTION get_assignable_users(
    p_group_id uuid,
    p_location_id uuid
)
RETURNS TABLE (
    id uuid,
    email text,
    first_name text,
    last_name text,
    role text,
    location_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.role,
        u.location_id
    FROM public.users u
    LEFT JOIN public.groups g ON g.id = p_group_id
    WHERE 
        -- User either belongs to the group OR is the group's manager
        (p_group_id = ANY(u.groups) OR u.id = g.manager_id)
        -- And either belongs to the specified location or has no location set
        AND (u.location_id = p_location_id OR u.location_id IS NULL)
        -- Only return active users
        AND EXISTS (
            SELECT 1 FROM auth.users au 
            WHERE au.id = u.id 
            AND au.deleted_at IS NULL
        )
    ORDER BY 
        u.first_name NULLS LAST,
        u.last_name NULLS LAST,
        u.email;
END;
$$;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION get_assignable_users TO authenticated;

-- Debug version of the function
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
    is_group_member boolean,
    is_group_manager boolean,
    matches_location boolean,
    sort_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.role,
        u.location_id,
        u.groups,
        p_group_id = ANY(u.groups) as is_group_member,
        u.id = g.manager_id as is_group_manager,
        (u.location_id = p_location_id OR u.location_id IS NULL) as matches_location,
        COALESCE(u.first_name, '') || ' ' || COALESCE(u.last_name, '') as sort_name
    FROM public.users u
    LEFT JOIN public.groups g ON g.id = p_group_id
    WHERE EXISTS (
        SELECT 1 FROM auth.users au 
        WHERE au.id = u.id 
        AND au.deleted_at IS NULL
    )
    ORDER BY 
        sort_name,
        u.email;
END;
$$;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION get_assignable_users_debug TO authenticated;
