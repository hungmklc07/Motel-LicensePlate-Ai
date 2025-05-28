-- Add building_id column to vehicles table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_name = 'vehicles' AND column_name = 'building_id') THEN
        ALTER TABLE vehicles ADD COLUMN building_id INTEGER REFERENCES buildings(id);
    END IF;
END
$$;

-- Check if any rows exist in vehicles table and make sure building_id is filled with default value
UPDATE vehicles 
SET building_id = (SELECT id FROM buildings ORDER BY id LIMIT 1)
WHERE building_id IS NULL;

-- Make building_id NOT NULL for future inserts
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.columns 
                WHERE table_name = 'vehicles' AND column_name = 'building_id') THEN
        ALTER TABLE vehicles ALTER COLUMN building_id SET NOT NULL;
    END IF;
END
$$; 