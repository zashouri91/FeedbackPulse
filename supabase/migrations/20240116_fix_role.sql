-- First check if user exists and what their role is
SELECT id, email, role 
FROM public.users 
WHERE id = auth.uid();

-- If user exists but JWT is missing role, we need to refresh the JWT claims
CREATE OR REPLACE FUNCTION refresh_jwt_claim()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_role text;
BEGIN
    -- Get the user's role from public.users
    SELECT role INTO user_role
    FROM public.users
    WHERE id = auth.uid();
    
    -- Update the user's JWT claim with their role
    IF user_role IS NOT NULL THEN
        UPDATE auth.users
        SET raw_app_meta_data = 
            COALESCE(raw_app_meta_data, '{}'::jsonb) || 
            jsonb_build_object('role', user_role)
        WHERE id = auth.uid();
    END IF;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION refresh_jwt_claim TO authenticated;

-- Run the function
SELECT refresh_jwt_claim();

-- Check if it worked
SELECT auth.jwt() ->> 'role' as current_user_role;
