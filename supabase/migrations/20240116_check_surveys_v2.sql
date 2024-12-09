-- Check surveys table schema
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE 
        WHEN is_nullable = 'NO' AND column_default IS NULL THEN 'Required'
        WHEN is_nullable = 'NO' AND column_default IS NOT NULL THEN 'Has Default'
        ELSE 'Optional'
    END as requirement_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'surveys'
ORDER BY ordinal_position;
