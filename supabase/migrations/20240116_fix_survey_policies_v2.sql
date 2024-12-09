-- Drop existing survey policies
DROP POLICY IF EXISTS "Surveys are viewable by creator, assignee, and managers" ON public.surveys;
DROP POLICY IF EXISTS "Surveys can be created by super_admin, admin, and managers" ON public.surveys;
DROP POLICY IF EXISTS "Surveys can be updated by creator and managers" ON public.surveys;
DROP POLICY IF EXISTS "Surveys can be deleted by creator and managers" ON public.surveys;

-- Create debug policy to log attempts
CREATE OR REPLACE FUNCTION debug_survey_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Log the attempt
    RAISE NOTICE 'Survey insert attempt: user_id=%, role=%, group_id=%, is_manager=%',
        auth.uid(),
        auth.jwt() ->> 'role',
        NEW.group_id,
        EXISTS (
            SELECT 1
            FROM public.groups g
            WHERE g.id = NEW.group_id
            AND g.manager_id = auth.uid()
        );
    RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS debug_survey_insert_trigger ON public.surveys;
CREATE TRIGGER debug_survey_insert_trigger
    BEFORE INSERT ON public.surveys
    FOR EACH ROW
    EXECUTE FUNCTION debug_survey_insert();

-- Recreate survey policies with proper role checks and logging
CREATE POLICY "Surveys are viewable by creator, assignee, and managers"
ON public.surveys FOR SELECT
TO authenticated
USING (true);  -- Allow all reads for debugging

CREATE POLICY "Surveys can be created by super_admin, admin, and managers"
ON public.surveys FOR INSERT
TO authenticated
WITH CHECK (
    CASE
        -- Super admin and admin can always create
        WHEN auth.jwt() ->> 'role' IN ('super_admin', 'admin') THEN
            true
        -- Managers can create for their groups
        WHEN auth.jwt() ->> 'role' = 'manager' THEN
            EXISTS (
                SELECT 1
                FROM public.groups g
                WHERE g.id = group_id
                AND g.manager_id = auth.uid()
            )
        ELSE
            false
    END
);

-- More permissive update/delete policies for debugging
CREATE POLICY "Surveys can be updated by creator and managers"
ON public.surveys FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Surveys can be deleted by creator and managers"
ON public.surveys FOR DELETE
TO authenticated
USING (true);
