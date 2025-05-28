-- Sample data for the license plate recognition system
-- This script adds sample buildings, vehicles, entry/exit records, and alerts

-- Sample buildings (thêm nếu chưa có)
INSERT INTO buildings (name, address, created_at)
SELECT 'Khu nhà trọ A', 'Số 123 Đường Nguyễn Văn A, Quận 1, TP.HCM', NOW() - INTERVAL '30 days'
WHERE NOT EXISTS (SELECT 1 FROM buildings WHERE name = 'Khu nhà trọ A');

INSERT INTO buildings (name, address, created_at)
SELECT 'Khu nhà trọ B', 'Số 456 Đường Lê Văn B, Quận 2, TP.HCM', NOW() - INTERVAL '28 days'
WHERE NOT EXISTS (SELECT 1 FROM buildings WHERE name = 'Khu nhà trọ B');

INSERT INTO buildings (name, address, created_at)
SELECT 'Khu nhà trọ C', 'Số 789 Đường Trần Văn C, Quận 3, TP.HCM', NOW() - INTERVAL '25 days'
WHERE NOT EXISTS (SELECT 1 FROM buildings WHERE name = 'Khu nhà trọ C');

-- Sample vehicles
INSERT INTO vehicles (license_plate, owner_name, vehicle_type, building_id, notes, created_at)
SELECT '59A-12345', 'Nguyễn Văn An', 'Xe máy', 
       (SELECT id FROM buildings WHERE name = 'Khu nhà trọ A' LIMIT 1),
       'Honda Wave Alpha màu đỏ', NOW() - INTERVAL '29 days'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE license_plate = '59A-12345');

INSERT INTO vehicles (license_plate, owner_name, vehicle_type, building_id, notes, created_at)
SELECT '59B-23456', 'Trần Thị Bình', 'Xe máy', 
       (SELECT id FROM buildings WHERE name = 'Khu nhà trọ A' LIMIT 1),
       'Yamaha Sirius màu xanh', NOW() - INTERVAL '28 days'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE license_plate = '59B-23456');

INSERT INTO vehicles (license_plate, owner_name, vehicle_type, building_id, notes, created_at)
SELECT '59C-34567', 'Lê Văn Công', 'Ô tô', 
       (SELECT id FROM buildings WHERE name = 'Khu nhà trọ A' LIMIT 1),
       'Toyota Vios màu trắng', NOW() - INTERVAL '27 days'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE license_plate = '59C-34567');

INSERT INTO vehicles (license_plate, owner_name, vehicle_type, building_id, notes, created_at)
SELECT '59D-45678', 'Phạm Thị Dung', 'Xe máy', 
       (SELECT id FROM buildings WHERE name = 'Khu nhà trọ A' LIMIT 1),
       'Honda Vision màu đen', NOW() - INTERVAL '26 days'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE license_plate = '59D-45678');

INSERT INTO vehicles (license_plate, owner_name, vehicle_type, building_id, notes, created_at)
SELECT '59E-56789', 'Hoàng Văn Em', 'Xe máy', 
       (SELECT id FROM buildings WHERE name = 'Khu nhà trọ B' LIMIT 1),
       'Suzuki Raider màu đỏ', NOW() - INTERVAL '25 days'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE license_plate = '59E-56789');

INSERT INTO vehicles (license_plate, owner_name, vehicle_type, building_id, notes, created_at)
SELECT '59F-67890', 'Ngô Thị Hoa', 'Xe máy', 
       (SELECT id FROM buildings WHERE name = 'Khu nhà trọ B' LIMIT 1),
       'Honda SH màu đen', NOW() - INTERVAL '24 days'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE license_plate = '59F-67890');

INSERT INTO vehicles (license_plate, owner_name, vehicle_type, building_id, notes, created_at)
SELECT '59G-78901', 'Đỗ Văn Giang', 'Ô tô', 
       (SELECT id FROM buildings WHERE name = 'Khu nhà trọ B' LIMIT 1),
       'Mazda 3 màu xanh', NOW() - INTERVAL '23 days'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE license_plate = '59G-78901');

INSERT INTO vehicles (license_plate, owner_name, vehicle_type, building_id, notes, created_at)
SELECT '59H-89012', 'Bùi Thị Hương', 'Xe máy', 
       (SELECT id FROM buildings WHERE name = 'Khu nhà trọ C' LIMIT 1),
       'Piaggio Liberty màu trắng', NOW() - INTERVAL '22 days'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE license_plate = '59H-89012');

INSERT INTO vehicles (license_plate, owner_name, vehicle_type, building_id, notes, created_at)
SELECT '59K-90123', 'Vũ Văn Khoa', 'Xe máy', 
       (SELECT id FROM buildings WHERE name = 'Khu nhà trọ C' LIMIT 1),
       'Honda Air Blade màu xám', NOW() - INTERVAL '21 days'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE license_plate = '59K-90123');

INSERT INTO vehicles (license_plate, owner_name, vehicle_type, building_id, notes, created_at)
SELECT '59L-01234', 'Đặng Thị Lan', 'Ô tô', 
       (SELECT id FROM buildings WHERE name = 'Khu nhà trọ C' LIMIT 1),
       'Hyundai Accent màu đỏ', NOW() - INTERVAL '20 days'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE license_plate = '59L-01234'); 