-- Check just the surveys table columns
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'surveys';

-- Check for any RLS policies that might reference survey_id
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'surveys';

-- Try a simple insert with minimal data
DO $$
DECLARE
    v_user_id uuid;
    v_group_id uuid;
    v_location_id uuid;
BEGIN
    -- Get current user
    v_user_id := auth.uid();
    
    -- Get first group
    SELECT id INTO v_group_id FROM public.groups LIMIT 1;
    
    -- Get first location
    SELECT id INTO v_location_id FROM public.locations LIMIT 1;
    
    -- Log what we're trying to insert
    RAISE NOTICE 'Attempting insert with: user_id=%, group_id=%, location_id=%', 
        v_user_id, v_group_id, v_location_id;
    
    -- Try insert
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
    
    RAISE NOTICE 'Insert successful';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Insert failed: %', SQLERRM;
END $$;
