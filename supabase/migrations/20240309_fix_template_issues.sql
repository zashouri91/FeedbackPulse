-- Drop existing policies
DROP POLICY IF EXISTS "Enable delete for template owners and assigned users" ON survey_templates;
DROP POLICY IF EXISTS "Enable update for template owners" ON survey_templates;

-- Create more permissive delete policy
CREATE POLICY "Enable delete for template owners and admins" ON survey_templates
    FOR DELETE TO authenticated
    USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND (
                u.role = 'admin' OR
                u.role = 'manager' OR
                u.groups && assigned_groups
            )
        )
    );

-- Create update policy
CREATE POLICY "Enable update for template owners and admins" ON survey_templates
    FOR UPDATE TO authenticated
    USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND (
                u.role = 'admin' OR
                u.role = 'manager' OR
                u.groups && assigned_groups
            )
        )
    )
    WITH CHECK (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND (
                u.role = 'admin' OR
                u.role = 'manager' OR
                u.groups && assigned_groups
            )
        )
    );

-- Add cascade delete for responses when template is deleted
ALTER TABLE survey_responses
    DROP CONSTRAINT IF EXISTS survey_responses_template_id_fkey,
    ADD CONSTRAINT survey_responses_template_id_fkey
        FOREIGN KEY (template_id)
        REFERENCES survey_templates(id)
        ON DELETE CASCADE;
