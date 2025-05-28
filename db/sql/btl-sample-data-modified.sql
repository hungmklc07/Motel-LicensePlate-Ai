-- Sample data for the license plate recognition system
-- This script adds sample buildings and vehicles for BTL_THPTHT database

-- Sample buildings
INSERT INTO buildings (name, address, created_at)
SELECT 'Khu nhà trọ A', 'Số 123 Đường Nguyễn Văn A, Quận 1, TP.HCM', NOW()
WHERE NOT EXISTS (SELECT 1 FROM buildings WHERE name = 'Khu nhà trọ A');

INSERT INTO buildings (name, address, created_at)
SELECT 'Khu nhà trọ B', 'Số 456 Đường Lê Văn B, Quận 2, TP.HCM', NOW()
WHERE NOT EXISTS (SELECT 1 FROM buildings WHERE name = 'Khu nhà trọ B');

INSERT INTO buildings (name, address, created_at)
SELECT 'Khu nhà trọ C', 'Số 789 Đường Trần Văn C, Quận 3, TP.HCM', NOW()
WHERE NOT EXISTS (SELECT 1 FROM buildings WHERE name = 'Khu nhà trọ C');

-- Sample vehicles - note that we're not using the 'notes' column as it doesn't exist in the schema
INSERT INTO vehicles (license_plate, owner_name, vehicle_type, building_id, is_registered, created_at)
SELECT '59A-12345', 'Nguyễn Văn An', 'Xe máy', 
       (SELECT id FROM buildings WHERE name = 'Khu nhà trọ A' LIMIT 1),
       true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE license_plate = '59A-12345');

INSERT INTO vehicles (license_plate, owner_name, vehicle_type, building_id, owner_phone, is_registered, created_at)
SELECT '59B-23456', 'Trần Thị Bình', 'Xe máy', 
       (SELECT id FROM buildings WHERE name = 'Khu nhà trọ A' LIMIT 1),
       '0901234567', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE license_plate = '59B-23456');

INSERT INTO vehicles (license_plate, owner_name, vehicle_type, building_id, owner_phone, is_registered, created_at)
SELECT '59C-34567', 'Lê Văn Công', 'Ô tô', 
       (SELECT id FROM buildings WHERE name = 'Khu nhà trọ A' LIMIT 1),
       '0912345678', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE license_plate = '59C-34567');

INSERT INTO vehicles (license_plate, owner_name, vehicle_type, building_id, is_registered, created_at)
SELECT '59D-45678', 'Phạm Thị Dung', 'Xe máy', 
       (SELECT id FROM buildings WHERE name = 'Khu nhà trọ A' LIMIT 1),
       true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE license_plate = '59D-45678');

INSERT INTO vehicles (license_plate, owner_name, vehicle_type, building_id, owner_phone, is_registered, created_at)
SELECT '59E-56789', 'Hoàng Văn Em', 'Xe máy', 
       (SELECT id FROM buildings WHERE name = 'Khu nhà trọ B' LIMIT 1),
       '0923456789', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE license_plate = '59E-56789');

INSERT INTO vehicles (license_plate, owner_name, vehicle_type, building_id, is_registered, created_at)
SELECT '59F-67890', 'Ngô Thị Hoa', 'Xe máy', 
       (SELECT id FROM buildings WHERE name = 'Khu nhà trọ B' LIMIT 1),
       true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE license_plate = '59F-67890');

INSERT INTO vehicles (license_plate, owner_name, vehicle_type, building_id, owner_phone, is_registered, created_at)
SELECT '59G-78901', 'Đỗ Văn Giang', 'Ô tô', 
       (SELECT id FROM buildings WHERE name = 'Khu nhà trọ B' LIMIT 1),
       '0934567890', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE license_plate = '59G-78901');

INSERT INTO vehicles (license_plate, owner_name, vehicle_type, building_id, is_registered, created_at)
SELECT '59H-89012', 'Bùi Thị Hương', 'Xe máy', 
       (SELECT id FROM buildings WHERE name = 'Khu nhà trọ C' LIMIT 1),
       true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE license_plate = '59H-89012');

INSERT INTO vehicles (license_plate, owner_name, vehicle_type, building_id, owner_phone, is_registered, created_at)
SELECT '59K-90123', 'Vũ Văn Khoa', 'Xe máy', 
       (SELECT id FROM buildings WHERE name = 'Khu nhà trọ C' LIMIT 1),
       '0945678901', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE license_plate = '59K-90123');

INSERT INTO vehicles (license_plate, owner_name, vehicle_type, building_id, is_registered, created_at)
SELECT '59L-01234', 'Đặng Thị Lan', 'Ô tô', 
       (SELECT id FROM buildings WHERE name = 'Khu nhà trọ C' LIMIT 1),
       true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE license_plate = '59L-01234'); 