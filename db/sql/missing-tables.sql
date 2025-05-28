-- Create buildings table if it doesn't exist
CREATE TABLE IF NOT EXISTS buildings (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create vehicles table for registered vehicles
CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    license_plate VARCHAR(20) NOT NULL UNIQUE,
    owner_name VARCHAR(100),
    vehicle_type VARCHAR(50),
    building_id INTEGER REFERENCES buildings(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create vehicles_in table for entry records
CREATE TABLE IF NOT EXISTS vehicles_in (
    id SERIAL PRIMARY KEY,
    license_plate VARCHAR(20) NOT NULL,
    building_id INTEGER REFERENCES buildings(id),
    time_in TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    image_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create vehicles_out table for exit records
CREATE TABLE IF NOT EXISTS vehicles_out (
    id SERIAL PRIMARY KEY,
    license_plate VARCHAR(20) NOT NULL,
    building_id INTEGER REFERENCES buildings(id),
    time_out TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    image_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Check if alerts table exists, if not create it
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    license_plate VARCHAR(20) NOT NULL,
    building_id INTEGER REFERENCES buildings(id),
    image_path VARCHAR(255),
    status VARCHAR(20) DEFAULT 'unprocessed',
    notes TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- If alerts table exists but is missing timestamp column, add it
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'alerts') AND 
       NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'alerts' AND column_name = 'timestamp') THEN
        ALTER TABLE alerts ADD COLUMN timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END
$$;

-- Insert a sample building if none exists
INSERT INTO buildings (name, address)
SELECT 'Main Building', '123 Main Street'
WHERE NOT EXISTS (SELECT 1 FROM buildings LIMIT 1); 