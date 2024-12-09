-- Create enum for rating types if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rating_type') THEN
        CREATE TYPE rating_type AS ENUM ('stars', 'smileys', 'emojis', 'numbers');
    END IF;
END $$;

-- Create survey templates table
CREATE TABLE IF NOT EXISTS survey_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    rating_type rating_type NOT NULL DEFAULT 'stars',
    scale_min INTEGER NOT NULL DEFAULT 1,
    scale_max INTEGER NOT NULL DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    created_by UUID REFERENCES auth.users(id),
    thank_you_message TEXT DEFAULT 'Thank you for your response',
    follow_up_message TEXT DEFAULT 'Please select the area in which you felt the associate excelled the most!'
);

-- Create response drivers table
CREATE TABLE IF NOT EXISTS response_drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES survey_templates(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create survey responses table
CREATE TABLE IF NOT EXISTS survey_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES survey_templates(id),
    rating INTEGER NOT NULL,
    selected_drivers UUID[] DEFAULT '{}',
    respondent_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add RLS policies if tables don't already have them
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'survey_templates' 
        AND policyname = 'Enable read access for authenticated users'
    ) THEN
        ALTER TABLE survey_templates ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Enable read access for authenticated users" ON survey_templates
            FOR SELECT TO authenticated USING (true);

        CREATE POLICY "Enable insert for authenticated users" ON survey_templates
            FOR INSERT TO authenticated WITH CHECK (true);

        CREATE POLICY "Enable update for template owners" ON survey_templates
            FOR UPDATE TO authenticated USING (auth.uid() = created_by);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'response_drivers' 
        AND policyname = 'Enable read access for all users'
    ) THEN
        ALTER TABLE response_drivers ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Enable read access for all users" ON response_drivers
            FOR SELECT USING (true);

        CREATE POLICY "Enable insert for authenticated users" ON response_drivers
            FOR INSERT TO authenticated WITH CHECK (true);

        CREATE POLICY "Enable update for authenticated users" ON response_drivers
            FOR UPDATE TO authenticated USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'survey_responses' 
        AND policyname = 'Enable insert for all users'
    ) THEN
        ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Enable insert for all users" ON survey_responses
            FOR INSERT WITH CHECK (true);

        CREATE POLICY "Enable read for authenticated users" ON survey_responses
            FOR SELECT TO authenticated USING (true);
    END IF;
END $$;
