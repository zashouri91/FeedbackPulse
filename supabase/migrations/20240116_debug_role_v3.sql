-- Check user in public.users
SELECT 
    id,
    email,
    role,
    groups,
    location_id
FROM public.users
WHERE id = auth.uid();

-- Check JWT claims
SELECT auth.jwt() ->> 'role' as jwt_role;

-- Check raw metadata in auth.users
SELECT 
    id,
    email,
    raw_app_meta_data,
    raw_user_meta_data
FROM auth.users
WHERE id = auth.uid();

-- Update JWT claims if needed
UPDATE auth.users
SET raw_app_meta_data = 
    COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', 'super_admin')
WHERE id = auth.uid()
AND (raw_app_meta_data ->> 'role' IS NULL OR raw_app_meta_data ->> 'role' != 'super_admin');

-- Add debugging trigger to surveys table
DROP TRIGGER IF EXISTS debug_survey_insert_trigger ON surveys;
CREATE OR REPLACE FUNCTION debug_survey_insert()
RETURNS TRIGGER AS $$
BEGIN
    RAISE NOTICE 'Attempting survey insert:';
    RAISE NOTICE 'User ID: %, Role: %, JWT Role: %', 
        auth.uid(),
        (SELECT role FROM public.users WHERE id = auth.uid()),
        auth.jwt() ->> 'role';
    RAISE NOTICE 'Group ID: %, Location ID: %, Assignee ID: %',
        NEW.group_id,
        NEW.location_id,
        NEW.assignee_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER debug_survey_insert_trigger
    BEFORE INSERT ON surveys
    FOR EACH ROW
    EXECUTE FUNCTION debug_survey_insert();

-- Check if RLS is enabled
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE oid = 'public.surveys'::regclass;
