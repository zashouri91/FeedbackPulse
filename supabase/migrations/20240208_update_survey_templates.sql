-- Drop existing enum and recreate with new values
DROP TYPE rating_type CASCADE;
CREATE TYPE rating_type AS ENUM ('numeric', 'stars', 'emoji');

-- Recreate survey templates table with new structure
CREATE TABLE IF NOT EXISTS survey_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    rating_type rating_type NOT NULL DEFAULT 'numeric',
    scale_min INTEGER NOT NULL DEFAULT 1,
    scale_max INTEGER NOT NULL DEFAULT 5,
    thank_you_message TEXT DEFAULT 'Thank you for your feedback!',
    follow_up_message TEXT DEFAULT 'Is there anything else you would like to share?',
    assigned_users UUID[] DEFAULT '{}',
    assigned_groups UUID[] DEFAULT '{}',
    assigned_locations UUID[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    created_by UUID REFERENCES auth.users(id)
);

-- Add new columns to existing table
ALTER TABLE survey_templates
ADD COLUMN IF NOT EXISTS assigned_users UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS assigned_groups UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS assigned_locations UUID[] DEFAULT '{}';

-- Update default messages
ALTER TABLE survey_templates
ALTER COLUMN thank_you_message SET DEFAULT 'Thank you for your feedback!',
ALTER COLUMN follow_up_message SET DEFAULT 'Is there anything else you would like to share?';

-- Add trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_survey_templates_updated_at ON survey_templates;
CREATE TRIGGER update_survey_templates_updated_at
    BEFORE UPDATE ON survey_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON survey_templates;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON survey_templates;
DROP POLICY IF EXISTS "Enable update for template owners" ON survey_templates;

CREATE POLICY "Enable read access for authenticated users" ON survey_templates
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users" ON survey_templates
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON survey_templates
    FOR UPDATE TO authenticated USING (
        auth.uid() = created_by OR
        auth.uid() = ANY(assigned_users) OR
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.groups && assigned_groups
        ) OR
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.location_id = ANY(assigned_locations)
        )
    );
