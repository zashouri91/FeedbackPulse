-- Drop the old function if it exists
DROP FUNCTION IF EXISTS debug_current_user();

-- Create a function to check the current user's role
CREATE OR REPLACE FUNCTION debug_current_user()
RETURNS TABLE (
    user_id uuid,
    user_email text,
    user_role text,
    is_super_admin boolean,
    is_admin boolean,
    is_manager boolean,
    managed_groups text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        auth.uid() as user_id,
        u.email as user_email,
        COALESCE(auth.jwt() ->> 'role', 'none') as user_role,
        (auth.jwt() ->> 'role' = 'super_admin') as is_super_admin,
        (auth.jwt() ->> 'role' = 'admin') as is_admin,
        (auth.jwt() ->> 'role' = 'manager') as is_manager,
        ARRAY(
            SELECT g.name::text
            FROM public.groups g
            WHERE g.manager_id = auth.uid()
        ) as managed_groups
    FROM auth.users u
    WHERE u.id = auth.uid();
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION debug_current_user TO authenticated;

-- Create a function to check group management
CREATE OR REPLACE FUNCTION debug_group_management(group_id uuid)
RETURNS TABLE (
    group_name text,
    group_manager_id uuid,
    current_user_id uuid,
    current_user_role text,
    is_group_manager boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        g.name as group_name,
        g.manager_id as group_manager_id,
        auth.uid() as current_user_id,
        auth.jwt() ->> 'role' as current_user_role,
        g.manager_id = auth.uid() as is_group_manager
    FROM public.groups g
    WHERE g.id = group_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION debug_group_management TO authenticated;
