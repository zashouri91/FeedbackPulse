-- Create a function to check the current user's role
CREATE OR REPLACE FUNCTION debug_current_user()
RETURNS TABLE (
    user_id uuid,
    email text,
    role text,
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
        (SELECT email FROM auth.users WHERE id = auth.uid()) as email,
        COALESCE(auth.jwt() ->> 'role', 'none') as role,
        (auth.jwt() ->> 'role' = 'super_admin') as is_super_admin,
        (auth.jwt() ->> 'role' = 'admin') as is_admin,
        (auth.jwt() ->> 'role' = 'manager') as is_manager,
        ARRAY(
            SELECT g.name::text
            FROM public.groups g
            WHERE g.manager_id = auth.uid()
        ) as managed_groups;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION debug_current_user TO authenticated;
