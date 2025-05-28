-- Fix missing tables and columns for BTL_THPTHT database

-- 1. Create vehicles_in table if not exists
CREATE TABLE IF NOT EXISTS vehicles_in (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id),
    license_plate VARCHAR(20) NOT NULL,
    entry_time TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    confidence FLOAT,
    image_path VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create vehicles_out table if not exists
CREATE TABLE IF NOT EXISTS vehicles_out (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id),
    license_plate VARCHAR(20) NOT NULL,
    exit_time TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    confidence FLOAT,
    image_path VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Fix alerts table - add timestamp column if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'alerts' AND column_name = 'timestamp') THEN
        ALTER TABLE alerts ADD COLUMN timestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- 4. Fix vehicles table - rename owner_phone to phone_number if needed
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vehicles' AND column_name = 'owner_phone') 
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vehicles' AND column_name = 'phone_number') THEN
        ALTER TABLE vehicles RENAME COLUMN owner_phone TO phone_number;
    END IF;
    
    -- In case we need to add the column if it doesn't exist at all
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vehicles' AND column_name = 'phone_number') 
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vehicles' AND column_name = 'owner_phone') THEN
        ALTER TABLE vehicles ADD COLUMN phone_number VARCHAR(20);
    END IF;
END $$; 