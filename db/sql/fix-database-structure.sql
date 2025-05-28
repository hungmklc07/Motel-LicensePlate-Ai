-- Fix database structure to match application code requirements

-- 1. Fix vehicles_in table - rename entry_time to time_in
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vehicles_in' AND column_name = 'entry_time') 
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vehicles_in' AND column_name = 'time_in') THEN
        ALTER TABLE vehicles_in RENAME COLUMN entry_time TO time_in;
    END IF;
    
    -- Add columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vehicles_in' AND column_name = 'image_url') THEN
        ALTER TABLE vehicles_in ADD COLUMN image_url VARCHAR(255);
    END IF;
END $$;

-- 2. Fix vehicles_out table - rename exit_time to time_out
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vehicles_out' AND column_name = 'exit_time') 
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vehicles_out' AND column_name = 'time_out') THEN
        ALTER TABLE vehicles_out RENAME COLUMN exit_time TO time_out;
    END IF;
    
    -- Add columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vehicles_out' AND column_name = 'image_url') THEN
        ALTER TABLE vehicles_out ADD COLUMN image_url VARCHAR(255);
    END IF;
END $$;

-- 3. Fix history table - ensure entry_time and exit_time exist
DO $$ 
BEGIN
    -- Ensure all required columns exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'history' AND column_name = 'image_url') THEN
        ALTER TABLE history ADD COLUMN image_url VARCHAR(255);
    END IF;
END $$;

-- 4. Add sample data for history with recent timestamps for today's date
DELETE FROM history WHERE license_plate = '59A-12345' AND DATE(entry_time) = CURRENT_DATE;
INSERT INTO history (license_plate, vehicle_id, entry_time, exit_time, camera_id, building_id, created_at)
VALUES 
    ('59A-12345', 1, CURRENT_DATE + INTERVAL '9 hours', CURRENT_DATE + INTERVAL '10 hours', '1', 4, NOW()),
    ('59B-23456', 2, CURRENT_DATE + INTERVAL '8 hours', CURRENT_DATE + INTERVAL '9 hours', '1', 4, NOW()),
    ('59C-34567', 3, CURRENT_DATE + INTERVAL '7 hours', CURRENT_DATE + INTERVAL '8 hours', '1', 4, NOW());

-- 5. Update vehicles_in data to ensure current data exists
DELETE FROM vehicles_in;
INSERT INTO vehicles_in (vehicle_id, license_plate, time_in, confidence, image_path, created_at)
VALUES 
    (5, '59E-56789', CURRENT_DATE + INTERVAL '10 hours', 0.95, '/images/vehicles/in1.jpg', NOW()),
    (7, '59G-78901', CURRENT_DATE + INTERVAL '11 hours', 0.93, '/images/vehicles/in2.jpg', NOW()); 