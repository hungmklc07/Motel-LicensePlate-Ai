-- Thêm dữ liệu mẫu cho bảng alerts
INSERT INTO alerts (license_plate, camera_id, status, image_path, timestamp, building_id, created_at)
SELECT 
    '80B-12345', -- license_plate (xe lạ)
    '1', -- camera_id
    'pending', -- status
    '/images/alerts/sample1.jpg', -- image_path
    NOW() - INTERVAL '30 minutes', -- timestamp
    4, -- building_id (tòa nhà A)
    NOW() -- created_at
WHERE NOT EXISTS (
    SELECT 1 FROM alerts 
    WHERE license_plate = '80B-12345' 
    AND timestamp = NOW() - INTERVAL '30 minutes'
);

INSERT INTO alerts (license_plate, camera_id, status, image_path, timestamp, building_id, created_at)
SELECT 
    '90C-54321', -- license_plate (xe lạ khác)
    '1', -- camera_id
    'pending', -- status
    '/images/alerts/sample2.jpg', -- image_path
    NOW() - INTERVAL '45 minutes', -- timestamp
    5, -- building_id (tòa nhà B)
    NOW() -- created_at
WHERE NOT EXISTS (
    SELECT 1 FROM alerts 
    WHERE license_plate = '90C-54321' 
    AND timestamp = NOW() - INTERVAL '45 minutes'
); 