-- Function to get assignable users based on group and location
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
    SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.role,
        u.location_id
    FROM public.users u
    WHERE 
        -- User belongs to the specified group
        p_group_id = ANY(u.groups)
        -- And either belongs to the specified location or has no location set
        AND (u.location_id = p_location_id OR u.location_id IS NULL)
        -- Only return active users
        AND EXISTS (
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
GRANT EXECUTE ON FUNCTION get_assignable_users TO authenticated;