-- First, let's check the current user's role and JWT
DO $$
DECLARE
    current_role text;
    jwt_role text;
BEGIN
    SELECT role INTO current_role FROM public.users WHERE id = auth.uid();
    SELECT auth.jwt() ->> 'role' INTO jwt_role;
    
    RAISE NOTICE 'Current user role: %, JWT role: %', current_role, jwt_role;
END $$;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable insert for managers" ON surveys;
DROP POLICY IF EXISTS "Enable read access for all" ON surveys;
DROP POLICY IF EXISTS "Enable update for managers" ON surveys;
DROP POLICY IF EXISTS "Enable delete for managers" ON surveys;

-- Create a simple policy for debugging
CREATE POLICY "Enable all for authenticated"
ON public.surveys
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Enable RLS
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;

-- Create a function to test survey insertion
CREATE OR REPLACE FUNCTION test_survey_insert(
    p_assignee_id uuid,
    p_group_id uuid,
    p_location_id uuid
) RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
    v_user_role text;
    v_jwt_role text;
BEGIN
    -- Get current user info
    SELECT auth.uid() INTO v_user_id;
    SELECT role INTO v_user_role FROM public.users WHERE id = v_user_id;
    SELECT auth.jwt() ->> 'role' INTO v_jwt_role;
    
    -- Log the attempt
    RAISE NOTICE 'Test survey insert:';
    RAISE NOTICE 'User ID: %, DB Role: %, JWT Role: %', v_user_id, v_user_role, v_jwt_role;
    RAISE NOTICE 'Assignee: %, Group: %, Location: %', p_assignee_id, p_group_id, p_location_id;
    
    -- Try the insert
    INSERT INTO surveys (assignee_id, group_id, location_id, creator_id)
    VALUES (p_assignee_id, p_group_id, p_location_id, v_user_id);
    
    RETURN 'Success';
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'Error: ' || SQLERRM;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION test_survey_insert TO authenticated;
