-- Check surveys table schema
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'surveys';

-- Check RLS policies on surveys table
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'surveys';

-- Create a debugging function for survey creation
CREATE OR REPLACE FUNCTION debug_survey_insert()
RETURNS TABLE (
    current_user_id uuid,
    current_user_email text,
    current_user_role text,
    has_insert_permission boolean,
    policy_check text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        auth.uid(),
        (SELECT email FROM auth.users WHERE id = auth.uid()),
        (SELECT role FROM public.users WHERE id = auth.uid()),
        EXISTS (
            SELECT 1 
            FROM pg_policies 
            WHERE tablename = 'surveys' 
            AND cmd = 'INSERT'
            AND roles @> ARRAY['authenticated']::name[]
        ),
        CASE 
            WHEN auth.jwt() ->> 'role' IS NULL THEN 'No role in JWT'
            WHEN (SELECT role FROM public.users WHERE id = auth.uid()) IS NULL THEN 'No role in public.users'
            ELSE 'Role exists: ' || (SELECT role FROM public.users WHERE id = auth.uid())
        END;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION debug_survey_insert TO authenticated;

-- Run the debug function
SELECT * FROM debug_survey_insert();
