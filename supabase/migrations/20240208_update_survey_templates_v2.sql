-- First, drop dependent tables and the enum
DROP TABLE IF EXISTS survey_responses;
DROP TABLE IF EXISTS response_drivers;
DROP TABLE IF EXISTS survey_templates;
DROP TYPE IF EXISTS rating_type CASCADE;

-- Recreate enum with new values
CREATE TYPE rating_type AS ENUM ('numeric', 'stars', 'emoji');

-- Recreate survey templates table with new structure
CREATE TABLE survey_templates (
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

-- Recreate response drivers table
CREATE TABLE response_drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES survey_templates(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Recreate survey responses table
CREATE TABLE survey_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES survey_templates(id),
    rating INTEGER NOT NULL,
    selected_drivers UUID[] DEFAULT '{}',
    respondent_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

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

-- Enable RLS
ALTER TABLE survey_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE response_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

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
