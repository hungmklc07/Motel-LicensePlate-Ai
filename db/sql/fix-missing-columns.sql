-- Đảm bảo cột building_id tồn tại trong bảng vehicles_in
ALTER TABLE vehicles_in DROP COLUMN IF EXISTS building_id;
ALTER TABLE vehicles_in ADD COLUMN building_id INTEGER REFERENCES buildings(id);

-- Đảm bảo cột building_id tồn tại trong bảng vehicles_out
ALTER TABLE vehicles_out DROP COLUMN IF EXISTS building_id;
ALTER TABLE vehicles_out ADD COLUMN building_id INTEGER REFERENCES buildings(id);

-- Tạo một bản sao của bảng vehicles_in với dữ liệu mới
CREATE TABLE IF NOT EXISTS vehicles_in_new (
    id SERIAL PRIMARY KEY,
    license_plate VARCHAR(20) NOT NULL,
    vehicle_id INTEGER REFERENCES vehicles(id),
    building_id INTEGER REFERENCES buildings(id),
    time_in TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    image_path VARCHAR(255),
    confidence DOUBLE PRECISION,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    image_url VARCHAR(255)
);

-- Tạo một bản sao của bảng vehicles_out với dữ liệu mới
CREATE TABLE IF NOT EXISTS vehicles_out_new (
    id SERIAL PRIMARY KEY,
    license_plate VARCHAR(20) NOT NULL,
    building_id INTEGER REFERENCES buildings(id),
    time_out TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    image_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Xóa dữ liệu cũ và thêm dữ liệu mẫu mới
TRUNCATE vehicles_in, vehicles_out CASCADE;

-- Thêm dữ liệu mẫu vào bảng vehicles_in
INSERT INTO vehicles_in (license_plate, vehicle_id, time_in, building_id, image_path) VALUES
-- Ngày 1
('59A-12345', 1, NOW() - INTERVAL '7 days' + INTERVAL '7 hours', 1, '/images/entries/59A-12345_1.jpg'),
('59B-23456', 2, NOW() - INTERVAL '7 days' + INTERVAL '8 hours', 1, '/images/entries/59B-23456_1.jpg'),
('59E-56789', 5, NOW() - INTERVAL '7 days' + INTERVAL '9 hours', 2, '/images/entries/59E-56789_1.jpg'),
('59H-89012', 8, NOW() - INTERVAL '7 days' + INTERVAL '10 hours', 3, '/images/entries/59H-89012_1.jpg'),

-- Ngày 2
('59C-34567', 3, NOW() - INTERVAL '6 days' + INTERVAL '7 hours', 1, '/images/entries/59C-34567_1.jpg'),
('59F-67890', 6, NOW() - INTERVAL '6 days' + INTERVAL '8 hours', 2, '/images/entries/59F-67890_1.jpg'),
('59K-90123', 9, NOW() - INTERVAL '6 days' + INTERVAL '9 hours', 3, '/images/entries/59K-90123_1.jpg'),

-- Ngày 3
('59A-12345', 1, NOW() - INTERVAL '5 days' + INTERVAL '7 hours', 1, '/images/entries/59A-12345_2.jpg'),
('59D-45678', 4, NOW() - INTERVAL '5 days' + INTERVAL '8 hours', 1, '/images/entries/59D-45678_1.jpg'),
('59G-78901', 7, NOW() - INTERVAL '5 days' + INTERVAL '9 hours', 2, '/images/entries/59G-78901_1.jpg'),
('59L-01234', 10, NOW() - INTERVAL '5 days' + INTERVAL '10 hours', 3, '/images/entries/59L-01234_1.jpg'),

-- Ngày 4
('59B-23456', 2, NOW() - INTERVAL '4 days' + INTERVAL '7 hours', 1, '/images/entries/59B-23456_2.jpg'),
('59E-56789', 5, NOW() - INTERVAL '4 days' + INTERVAL '8 hours', 2, '/images/entries/59E-56789_2.jpg'),
('59H-89012', 8, NOW() - INTERVAL '4 days' + INTERVAL '9 hours', 3, '/images/entries/59H-89012_2.jpg'),

-- Ngày 5
('59A-12345', 1, NOW() - INTERVAL '3 days' + INTERVAL '7 hours', 1, '/images/entries/59A-12345_3.jpg'),
('59C-34567', 3, NOW() - INTERVAL '3 days' + INTERVAL '8 hours', 1, '/images/entries/59C-34567_2.jpg'),
('59F-67890', 6, NOW() - INTERVAL '3 days' + INTERVAL '9 hours', 2, '/images/entries/59F-67890_2.jpg'),
('59K-90123', 9, NOW() - INTERVAL '3 days' + INTERVAL '10 hours', 3, '/images/entries/59K-90123_2.jpg'),

-- Ngày hôm nay
('59A-12345', 1, NOW() - INTERVAL '8 hours', 1, '/images/entries/59A-12345_4.jpg'),
('59C-34567', 3, NOW() - INTERVAL '7 hours', 1, '/images/entries/59C-34567_3.jpg'),
('59E-56789', 5, NOW() - INTERVAL '6 hours', 2, '/images/entries/59E-56789_3.jpg'),
('59H-89012', 8, NOW() - INTERVAL '5 hours', 3, '/images/entries/59H-89012_3.jpg');

-- Thêm dữ liệu mẫu vào bảng vehicles_out
INSERT INTO vehicles_out (license_plate, time_out, building_id, image_path) VALUES
-- Ngày 1
('59A-12345', NOW() - INTERVAL '7 days' + INTERVAL '17 hours', 1, '/images/exits/59A-12345_1.jpg'),
('59B-23456', NOW() - INTERVAL '7 days' + INTERVAL '18 hours', 1, '/images/exits/59B-23456_1.jpg'),
('59E-56789', NOW() - INTERVAL '7 days' + INTERVAL '19 hours', 2, '/images/exits/59E-56789_1.jpg'),
('59H-89012', NOW() - INTERVAL '7 days' + INTERVAL '20 hours', 3, '/images/exits/59H-89012_1.jpg'),

-- Ngày 2
('59C-34567', NOW() - INTERVAL '6 days' + INTERVAL '17 hours', 1, '/images/exits/59C-34567_1.jpg'),
('59F-67890', NOW() - INTERVAL '6 days' + INTERVAL '18 hours', 2, '/images/exits/59F-67890_1.jpg'),
('59K-90123', NOW() - INTERVAL '6 days' + INTERVAL '19 hours', 3, '/images/exits/59K-90123_1.jpg'),

-- Ngày 3
('59A-12345', NOW() - INTERVAL '5 days' + INTERVAL '17 hours', 1, '/images/exits/59A-12345_2.jpg'),
('59D-45678', NOW() - INTERVAL '5 days' + INTERVAL '18 hours', 1, '/images/exits/59D-45678_1.jpg'),
('59G-78901', NOW() - INTERVAL '5 days' + INTERVAL '19 hours', 2, '/images/exits/59G-78901_1.jpg'),
('59L-01234', NOW() - INTERVAL '5 days' + INTERVAL '20 hours', 3, '/images/exits/59L-01234_1.jpg'),

-- Ngày 4
('59B-23456', NOW() - INTERVAL '4 days' + INTERVAL '17 hours', 1, '/images/exits/59B-23456_2.jpg'),
('59E-56789', NOW() - INTERVAL '4 days' + INTERVAL '18 hours', 2, '/images/exits/59E-56789_2.jpg'),
('59H-89012', NOW() - INTERVAL '4 days' + INTERVAL '19 hours', 3, '/images/exits/59H-89012_2.jpg'),

-- Ngày 5
('59A-12345', NOW() - INTERVAL '3 days' + INTERVAL '17 hours', 1, '/images/exits/59A-12345_3.jpg'),
('59C-34567', NOW() - INTERVAL '3 days' + INTERVAL '18 hours', 1, '/images/exits/59C-34567_2.jpg'),
('59F-67890', NOW() - INTERVAL '3 days' + INTERVAL '19 hours', 2, '/images/exits/59F-67890_2.jpg'),
('59K-90123', NOW() - INTERVAL '3 days' + INTERVAL '20 hours', 3, '/images/exits/59K-90123_2.jpg'),

-- Một số xe đã ra hôm nay
('59A-12345', NOW() - INTERVAL '2 hours', 1, '/images/exits/59A-12345_4.jpg'),
('59E-56789', NOW() - INTERVAL '1 hour', 2, '/images/exits/59E-56789_3.jpg'); 