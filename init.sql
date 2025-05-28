-- Init.sql - Database initialization for License Plate Recognition System

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    building_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create buildings table
CREATE TABLE IF NOT EXISTS buildings (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    vehicle_type VARCHAR(50),
    owner_name VARCHAR(255),
    owner_phone VARCHAR(20),
    is_registered BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    building_id INTEGER REFERENCES buildings(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create history table
CREATE TABLE IF NOT EXISTS history (
    id SERIAL PRIMARY KEY,
    license_plate VARCHAR(20) NOT NULL,
    vehicle_id INTEGER REFERENCES vehicles(id),
    entry_time TIMESTAMP,
    exit_time TIMESTAMP,
    camera_id VARCHAR(50),
    image_path VARCHAR(255),
    confidence DECIMAL(5,2),
    building_id INTEGER REFERENCES buildings(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    license_plate VARCHAR(20) NOT NULL,
    camera_id VARCHAR(50),
    image_path VARCHAR(255),
    confidence DECIMAL(5,2),
    status VARCHAR(50) DEFAULT 'pending',
    processed_by INTEGER REFERENCES users(id),
    building_id INTEGER REFERENCES buildings(id),
    notes TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng lưu thông tin xe vào
CREATE TABLE IF NOT EXISTS vehicles_in (
    id SERIAL PRIMARY KEY,
    license_plate VARCHAR(20) NOT NULL,
    vehicle_id INTEGER REFERENCES vehicles(id),
    building_id INTEGER REFERENCES buildings(id),
    time_in TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    image_path VARCHAR(255),
    confidence FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng lưu thông tin xe ra
CREATE TABLE IF NOT EXISTS vehicles_out (
    id SERIAL PRIMARY KEY,
    license_plate VARCHAR(20) NOT NULL,
    vehicle_id INTEGER REFERENCES vehicles(id),
    building_id INTEGER REFERENCES buildings(id),
    time_out TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    image_path VARCHAR(255),
    confidence FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user with password 'admin123'
INSERT INTO users (username, password, full_name, role)
VALUES ('admin', '$2b$10$p8TePF9qXVbfE4Q5aJZDvu7Wd5g0zFdOQvKU35c8ZwgTaE.I.tKUi', 'Administrator', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Dữ liệu mẫu cho buildings
INSERT INTO buildings (name, address)
SELECT 'Khu nhà trọ A', 'Số 123 Đường Nguyễn Văn A, Quận 1, TP.HCM'
WHERE NOT EXISTS (SELECT 1 FROM buildings WHERE name = 'Khu nhà trọ A');
INSERT INTO buildings (name, address)
SELECT 'Khu nhà trọ B', 'Số 456 Đường Lê Văn B, Quận 2, TP.HCM'
WHERE NOT EXISTS (SELECT 1 FROM buildings WHERE name = 'Khu nhà trọ B');
INSERT INTO buildings (name, address)
SELECT 'Khu nhà trọ C', 'Số 789 Đường Trần Văn C, Quận 3, TP.HCM'
WHERE NOT EXISTS (SELECT 1 FROM buildings WHERE name = 'Khu nhà trọ C');

-- Dữ liệu mẫu cho vehicles
INSERT INTO vehicles (license_plate, owner_name, vehicle_type, building_id)
SELECT '59A-12345', 'Nguyễn Văn An', 'Xe máy', 1 WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE license_plate = '59A-12345');
INSERT INTO vehicles (license_plate, owner_name, vehicle_type, building_id)
SELECT '59B-23456', 'Trần Thị Bình', 'Xe máy', 1 WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE license_plate = '59B-23456');
INSERT INTO vehicles (license_plate, owner_name, vehicle_type, building_id)
SELECT '59C-34567', 'Lê Văn Công', 'Ô tô', 1 WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE license_plate = '59C-34567');
INSERT INTO vehicles (license_plate, owner_name, vehicle_type, building_id)
SELECT '59D-45678', 'Phạm Thị Dung', 'Xe máy', 1 WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE license_plate = '59D-45678');
INSERT INTO vehicles (license_plate, owner_name, vehicle_type, building_id)
SELECT '59E-56789', 'Hoàng Văn Em', 'Xe máy', 2 WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE license_plate = '59E-56789');
INSERT INTO vehicles (license_plate, owner_name, vehicle_type, building_id)
SELECT '59F-67890', 'Ngô Thị Hoa', 'Xe máy', 2 WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE license_plate = '59F-67890');
INSERT INTO vehicles (license_plate, owner_name, vehicle_type, building_id)
SELECT '59G-78901', 'Đỗ Văn Giang', 'Ô tô', 2 WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE license_plate = '59G-78901');
INSERT INTO vehicles (license_plate, owner_name, vehicle_type, building_id)
SELECT '59H-89012', 'Bùi Thị Hương', 'Xe máy', 3 WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE license_plate = '59H-89012');
INSERT INTO vehicles (license_plate, owner_name, vehicle_type, building_id)
SELECT '59K-90123', 'Vũ Văn Khoa', 'Xe máy', 3 WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE license_plate = '59K-90123');
INSERT INTO vehicles (license_plate, owner_name, vehicle_type, building_id)
SELECT '59L-01234', 'Đặng Thị Lan', 'Ô tô', 3 WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE license_plate = '59L-01234');

-- Dữ liệu mẫu cho vehicles_in
INSERT INTO vehicles_in (license_plate, building_id, time_in, image_path)
SELECT '59A-12345', 1, NOW() - INTERVAL '1 day', '/images/entries/59A-12345_1.jpg' WHERE NOT EXISTS (SELECT 1 FROM vehicles_in WHERE license_plate = '59A-12345');
INSERT INTO vehicles_in (license_plate, building_id, time_in, image_path)
SELECT '59B-23456', 1, NOW() - INTERVAL '2 days', '/images/entries/59B-23456_1.jpg' WHERE NOT EXISTS (SELECT 1 FROM vehicles_in WHERE license_plate = '59B-23456');

-- Dữ liệu mẫu cho vehicles_out
INSERT INTO vehicles_out (license_plate, building_id, time_out, image_path)
SELECT '59A-12345', 1, NOW() - INTERVAL '1 hour', '/images/exits/59A-12345_1.jpg' WHERE NOT EXISTS (SELECT 1 FROM vehicles_out WHERE license_plate = '59A-12345');

-- Dữ liệu mẫu cho alerts
INSERT INTO alerts (license_plate, camera_id, status, image_path, building_id)
SELECT '80B-12345', '1', 'pending', '/images/alerts/sample1.jpg', 1 WHERE NOT EXISTS (SELECT 1 FROM alerts WHERE license_plate = '80B-12345'); 