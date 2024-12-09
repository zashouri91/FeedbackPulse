-- Drop existing delete policy if it exists
DROP POLICY IF EXISTS "Enable delete for template owners" ON survey_templates;

-- Add delete policy for template owners and assigned users
CREATE POLICY "Enable delete for template owners and assigned users" ON survey_templates
    FOR DELETE TO authenticated
    USING (
        auth.uid() = created_by OR
        auth.uid() = ANY(assigned_users) OR
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.groups && assigned_groups
        )
    );

-- Ensure RLS is enabled
ALTER TABLE survey_templates ENABLE ROW LEVEL SECURITY;
