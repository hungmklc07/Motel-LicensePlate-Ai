-- Thêm dữ liệu mẫu cho bảng history
-- Dữ liệu lịch sử ra vào xe

-- Thêm dữ liệu vào bảng history
INSERT INTO history (license_plate, vehicle_id, entry_time, exit_time, camera_id, building_id, created_at)
SELECT 
    '59A-12345', -- license_plate
    1, -- vehicle_id (đã có trong bảng vehicles)
    NOW() - INTERVAL '3 hours', -- entry_time
    NOW() - INTERVAL '2 hours', -- exit_time
    1, -- camera_id
    4, -- building_id (tòa nhà A)
    NOW() -- created_at
WHERE NOT EXISTS (
    SELECT 1 FROM history 
    WHERE license_plate = '59A-12345' 
    AND entry_time = NOW() - INTERVAL '3 hours'
);

INSERT INTO history (license_plate, vehicle_id, entry_time, exit_time, camera_id, building_id, created_at)
SELECT 
    '59B-23456', -- license_plate
    2, -- vehicle_id
    NOW() - INTERVAL '4 hours', -- entry_time
    NOW() - INTERVAL '3 hours', -- exit_time
    1, -- camera_id
    4, -- building_id (tòa nhà A)
    NOW() -- created_at
WHERE NOT EXISTS (
    SELECT 1 FROM history 
    WHERE license_plate = '59B-23456' 
    AND entry_time = NOW() - INTERVAL '4 hours'
);

INSERT INTO history (license_plate, vehicle_id, entry_time, exit_time, camera_id, building_id, created_at)
SELECT 
    '59C-34567', -- license_plate
    3, -- vehicle_id
    NOW() - INTERVAL '5 hours', -- entry_time
    NOW() - INTERVAL '4 hours', -- exit_time
    1, -- camera_id
    4, -- building_id (tòa nhà A)
    NOW() -- created_at
WHERE NOT EXISTS (
    SELECT 1 FROM history 
    WHERE license_plate = '59C-34567' 
    AND entry_time = NOW() - INTERVAL '5 hours'
);

INSERT INTO history (license_plate, vehicle_id, entry_time, exit_time, camera_id, building_id, created_at)
SELECT 
    '59D-45678', -- license_plate
    4, -- vehicle_id
    NOW() - INTERVAL '6 hours', -- entry_time
    NOW() - INTERVAL '5 hours', -- exit_time
    1, -- camera_id
    4, -- building_id (tòa nhà A)
    NOW() -- created_at
WHERE NOT EXISTS (
    SELECT 1 FROM history 
    WHERE license_plate = '59D-45678' 
    AND entry_time = NOW() - INTERVAL '6 hours'
);

INSERT INTO history (license_plate, vehicle_id, entry_time, camera_id, building_id, created_at)
SELECT 
    '59E-56789', -- license_plate
    5, -- vehicle_id
    NOW() - INTERVAL '1 hour', -- entry_time
    1, -- camera_id
    5, -- building_id (tòa nhà B)
    NOW() -- created_at
WHERE NOT EXISTS (
    SELECT 1 FROM history 
    WHERE license_plate = '59E-56789' 
    AND entry_time = NOW() - INTERVAL '1 hour'
);

-- Thêm dữ liệu mẫu cho bảng vehicles_in
INSERT INTO vehicles_in (vehicle_id, license_plate, entry_time, confidence, created_at)
SELECT 
    5, -- vehicle_id
    '59E-56789', -- license_plate
    NOW() - INTERVAL '1 hour', -- entry_time
    0.95, -- confidence
    NOW() -- created_at
WHERE NOT EXISTS (
    SELECT 1 FROM vehicles_in 
    WHERE license_plate = '59E-56789' 
    AND entry_time = NOW() - INTERVAL '1 hour'
);

INSERT INTO vehicles_in (vehicle_id, license_plate, entry_time, confidence, created_at)
SELECT 
    7, -- vehicle_id
    '59G-78901', -- license_plate
    NOW() - INTERVAL '2 hours', -- entry_time
    0.93, -- confidence
    NOW() -- created_at
WHERE NOT EXISTS (
    SELECT 1 FROM vehicles_in 
    WHERE license_plate = '59G-78901' 
    AND entry_time = NOW() - INTERVAL '2 hours'
);

-- Thêm dữ liệu mẫu cho bảng alerts
INSERT INTO alerts (license_plate, vehicle_type, status, image_path, timestamp, created_at)
SELECT 
    '80B-12345', -- license_plate (xe lạ)
    'Xe máy', -- vehicle_type
    'pending', -- status
    '/images/alerts/sample1.jpg', -- image_path
    NOW() - INTERVAL '30 minutes', -- timestamp
    NOW() -- created_at
WHERE NOT EXISTS (
    SELECT 1 FROM alerts 
    WHERE license_plate = '80B-12345' 
    AND timestamp = NOW() - INTERVAL '30 minutes'
);

INSERT INTO alerts (license_plate, vehicle_type, status, image_path, timestamp, created_at)
SELECT 
    '90C-54321', -- license_plate (xe lạ khác)
    'Ô tô', -- vehicle_type
    'pending', -- status
    '/images/alerts/sample2.jpg', -- image_path
    NOW() - INTERVAL '45 minutes', -- timestamp
    NOW() -- created_at
WHERE NOT EXISTS (
    SELECT 1 FROM alerts 
    WHERE license_plate = '90C-54321' 
    AND timestamp = NOW() - INTERVAL '45 minutes'
); 