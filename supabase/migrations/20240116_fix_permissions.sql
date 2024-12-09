-- Grant necessary permissions to authenticated role
GRANT INSERT, SELECT, UPDATE, DELETE ON public.surveys TO authenticated;

-- Verify permissions after grant
SELECT 
    grantee,
    table_name,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'surveys'
AND grantee = 'authenticated';

-- Enable RLS
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policy for testing
DROP POLICY IF EXISTS "Enable all for authenticated" ON surveys;
CREATE POLICY "Enable all for authenticated"
ON public.surveys
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create a test survey to verify permissions
DO $$
DECLARE
    v_user_id uuid;
    v_location_id uuid;
    v_group_id uuid;
BEGIN
    -- Get current user
    v_user_id := auth.uid();
    
    -- Get first available location
    SELECT id INTO v_location_id FROM public.locations LIMIT 1;
    
    -- Get first available group
    SELECT id INTO v_group_id FROM public.groups LIMIT 1;
    
    -- Try to insert
    IF v_location_id IS NOT NULL AND v_group_id IS NOT NULL THEN
        INSERT INTO public.surveys (
            assignee_id,
            group_id,
            location_id,
            creator_id
        ) VALUES (
            v_user_id,
            v_group_id,
            v_location_id,
            v_user_id
        );
        RAISE NOTICE 'Test survey created successfully';
    ELSE
        RAISE NOTICE 'Could not find location or group';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating test survey: %', SQLERRM;
END $$;
