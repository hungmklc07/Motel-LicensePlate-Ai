-- Fixed sample data for the license plate recognition system
-- This script adds sample buildings, vehicles, entry/exit records, and alerts

-- Clean up existing data first
TRUNCATE users, vehicles, buildings, history, alerts, vehicles_in, vehicles_out CASCADE;

-- Reset sequences
ALTER SEQUENCE buildings_id_seq RESTART WITH 1;
ALTER SEQUENCE vehicles_id_seq RESTART WITH 1;
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE history_id_seq RESTART WITH 1;
ALTER SEQUENCE alerts_id_seq RESTART WITH 1;
ALTER SEQUENCE vehicles_in_id_seq RESTART WITH 1;
ALTER SEQUENCE vehicles_out_id_seq RESTART WITH 1;

-- Sample buildings
INSERT INTO buildings (name, address, created_at) VALUES
('Khu nhà trọ A', 'Số 123 Đường Nguyễn Văn A, Quận 1, TP.HCM', NOW() - INTERVAL '30 days'),
('Khu nhà trọ B', 'Số 456 Đường Lê Văn B, Quận 2, TP.HCM', NOW() - INTERVAL '28 days'),
('Khu nhà trọ C', 'Số 789 Đường Trần Văn C, Quận 3, TP.HCM', NOW() - INTERVAL '25 days');

-- Sample vehicles
INSERT INTO vehicles (license_plate, owner_name, vehicle_type, building_id, created_at) VALUES
-- Khu A
('59A-12345', 'Nguyễn Văn An', 'Xe máy', 1, NOW() - INTERVAL '29 days'),
('59B-23456', 'Trần Thị Bình', 'Xe máy', 1, NOW() - INTERVAL '28 days'),
('59C-34567', 'Lê Văn Công', 'Ô tô', 1, NOW() - INTERVAL '27 days'),
('59D-45678', 'Phạm Thị Dung', 'Xe máy', 1, NOW() - INTERVAL '26 days'),
-- Khu B
('59E-56789', 'Hoàng Văn Em', 'Xe máy', 2, NOW() - INTERVAL '25 days'),
('59F-67890', 'Ngô Thị Hoa', 'Xe máy', 2, NOW() - INTERVAL '24 days'),
('59G-78901', 'Đỗ Văn Giang', 'Ô tô', 2, NOW() - INTERVAL '23 days'),
-- Khu C
('59H-89012', 'Bùi Thị Hương', 'Xe máy', 3, NOW() - INTERVAL '22 days'),
('59K-90123', 'Vũ Văn Khoa', 'Xe máy', 3, NOW() - INTERVAL '21 days'),
('59L-01234', 'Đặng Thị Lan', 'Ô tô', 3, NOW() - INTERVAL '20 days');

-- Sample vehicles_in (entry records)
INSERT INTO vehicles_in (license_plate, vehicle_id, time_in, building_id, image_path) VALUES
-- Day 1
('59A-12345', 1, NOW() - INTERVAL '7 days' + INTERVAL '7 hours', 1, '/images/entries/59A-12345_1.jpg'),
('59B-23456', 2, NOW() - INTERVAL '7 days' + INTERVAL '8 hours', 1, '/images/entries/59B-23456_1.jpg'),
('59E-56789', 5, NOW() - INTERVAL '7 days' + INTERVAL '9 hours', 2, '/images/entries/59E-56789_1.jpg'),
('59H-89012', 8, NOW() - INTERVAL '7 days' + INTERVAL '10 hours', 3, '/images/entries/59H-89012_1.jpg'),

-- Day 2
('59C-34567', 3, NOW() - INTERVAL '6 days' + INTERVAL '7 hours', 1, '/images/entries/59C-34567_1.jpg'),
('59F-67890', 6, NOW() - INTERVAL '6 days' + INTERVAL '8 hours', 2, '/images/entries/59F-67890_1.jpg'),
('59K-90123', 9, NOW() - INTERVAL '6 days' + INTERVAL '9 hours', 3, '/images/entries/59K-90123_1.jpg'),

-- Day 3
('59A-12345', 1, NOW() - INTERVAL '5 days' + INTERVAL '7 hours', 1, '/images/entries/59A-12345_2.jpg'),
('59D-45678', 4, NOW() - INTERVAL '5 days' + INTERVAL '8 hours', 1, '/images/entries/59D-45678_1.jpg'),
('59G-78901', 7, NOW() - INTERVAL '5 days' + INTERVAL '9 hours', 2, '/images/entries/59G-78901_1.jpg'),
('59L-01234', 10, NOW() - INTERVAL '5 days' + INTERVAL '10 hours', 3, '/images/entries/59L-01234_1.jpg'),

-- Day 4
('59B-23456', 2, NOW() - INTERVAL '4 days' + INTERVAL '7 hours', 1, '/images/entries/59B-23456_2.jpg'),
('59E-56789', 5, NOW() - INTERVAL '4 days' + INTERVAL '8 hours', 2, '/images/entries/59E-56789_2.jpg'),
('59H-89012', 8, NOW() - INTERVAL '4 days' + INTERVAL '9 hours', 3, '/images/entries/59H-89012_2.jpg'),

-- Day 5
('59A-12345', 1, NOW() - INTERVAL '3 days' + INTERVAL '7 hours', 1, '/images/entries/59A-12345_3.jpg'),
('59C-34567', 3, NOW() - INTERVAL '3 days' + INTERVAL '8 hours', 1, '/images/entries/59C-34567_2.jpg'),
('59F-67890', 6, NOW() - INTERVAL '3 days' + INTERVAL '9 hours', 2, '/images/entries/59F-67890_2.jpg'),
('59K-90123', 9, NOW() - INTERVAL '3 days' + INTERVAL '10 hours', 3, '/images/entries/59K-90123_2.jpg'),

-- Today's entry
('59A-12345', 1, NOW() - INTERVAL '8 hours', 1, '/images/entries/59A-12345_4.jpg'),
('59C-34567', 3, NOW() - INTERVAL '7 hours', 1, '/images/entries/59C-34567_3.jpg'),
('59E-56789', 5, NOW() - INTERVAL '6 hours', 2, '/images/entries/59E-56789_3.jpg'),
('59H-89012', 8, NOW() - INTERVAL '5 hours', 3, '/images/entries/59H-89012_3.jpg');

-- Sample vehicles_out (exit records)
INSERT INTO vehicles_out (license_plate, time_out, building_id, image_path) VALUES
-- Day 1
('59A-12345', NOW() - INTERVAL '7 days' + INTERVAL '17 hours', 1, '/images/exits/59A-12345_1.jpg'),
('59B-23456', NOW() - INTERVAL '7 days' + INTERVAL '18 hours', 1, '/images/exits/59B-23456_1.jpg'),
('59E-56789', NOW() - INTERVAL '7 days' + INTERVAL '19 hours', 2, '/images/exits/59E-56789_1.jpg'),
('59H-89012', NOW() - INTERVAL '7 days' + INTERVAL '20 hours', 3, '/images/exits/59H-89012_1.jpg'),

-- Day 2
('59C-34567', NOW() - INTERVAL '6 days' + INTERVAL '17 hours', 1, '/images/exits/59C-34567_1.jpg'),
('59F-67890', NOW() - INTERVAL '6 days' + INTERVAL '18 hours', 2, '/images/exits/59F-67890_1.jpg'),
('59K-90123', NOW() - INTERVAL '6 days' + INTERVAL '19 hours', 3, '/images/exits/59K-90123_1.jpg'),

-- Day 3
('59A-12345', NOW() - INTERVAL '5 days' + INTERVAL '17 hours', 1, '/images/exits/59A-12345_2.jpg'),
('59D-45678', NOW() - INTERVAL '5 days' + INTERVAL '18 hours', 1, '/images/exits/59D-45678_1.jpg'),
('59G-78901', NOW() - INTERVAL '5 days' + INTERVAL '19 hours', 2, '/images/exits/59G-78901_1.jpg'),
('59L-01234', NOW() - INTERVAL '5 days' + INTERVAL '20 hours', 3, '/images/exits/59L-01234_1.jpg'),

-- Day 4
('59B-23456', NOW() - INTERVAL '4 days' + INTERVAL '17 hours', 1, '/images/exits/59B-23456_2.jpg'),
('59E-56789', NOW() - INTERVAL '4 days' + INTERVAL '18 hours', 2, '/images/exits/59E-56789_2.jpg'),
('59H-89012', NOW() - INTERVAL '4 days' + INTERVAL '19 hours', 3, '/images/exits/59H-89012_2.jpg'),

-- Day 5
('59A-12345', NOW() - INTERVAL '3 days' + INTERVAL '17 hours', 1, '/images/exits/59A-12345_3.jpg'),
('59C-34567', NOW() - INTERVAL '3 days' + INTERVAL '18 hours', 1, '/images/exits/59C-34567_2.jpg'),
('59F-67890', NOW() - INTERVAL '3 days' + INTERVAL '19 hours', 2, '/images/exits/59F-67890_2.jpg'),
('59K-90123', NOW() - INTERVAL '3 days' + INTERVAL '20 hours', 3, '/images/exits/59K-90123_2.jpg'),

-- Some vehicles exited today
('59A-12345', NOW() - INTERVAL '2 hours', 1, '/images/exits/59A-12345_4.jpg'),
('59E-56789', NOW() - INTERVAL '1 hour', 2, '/images/exits/59E-56789_3.jpg');

-- Sample history records
INSERT INTO history (license_plate, vehicle_id, entry_time, exit_time, image_path, building_id, created_at) VALUES
-- Day 1
('59A-12345', 1, NOW() - INTERVAL '7 days' + INTERVAL '7 hours', NOW() - INTERVAL '7 days' + INTERVAL '17 hours', '/images/entries/59A-12345_1.jpg', 1, NOW() - INTERVAL '7 days'),
('59B-23456', 2, NOW() - INTERVAL '7 days' + INTERVAL '8 hours', NOW() - INTERVAL '7 days' + INTERVAL '18 hours', '/images/entries/59B-23456_1.jpg', 1, NOW() - INTERVAL '7 days'),
('59E-56789', 5, NOW() - INTERVAL '7 days' + INTERVAL '9 hours', NOW() - INTERVAL '7 days' + INTERVAL '19 hours', '/images/entries/59E-56789_1.jpg', 2, NOW() - INTERVAL '7 days'),
('59H-89012', 8, NOW() - INTERVAL '7 days' + INTERVAL '10 hours', NOW() - INTERVAL '7 days' + INTERVAL '20 hours', '/images/entries/59H-89012_1.jpg', 3, NOW() - INTERVAL '7 days');

-- Sample alerts (unregistered vehicles)
INSERT INTO alerts (license_plate, image_path, status, building_id, created_at) VALUES
('51A-99999', '/images/alerts/51A-99999.jpg', 'pending', 1, NOW() - INTERVAL '7 days' + INTERVAL '10 hours'),
('52B-88888', '/images/alerts/52B-88888.jpg', 'pending', 2, NOW() - INTERVAL '6 days' + INTERVAL '11 hours'),
('53C-77777', '/images/alerts/53C-77777.jpg', 'pending', 3, NOW() - INTERVAL '5 days' + INTERVAL '12 hours'),
('54D-66666', '/images/alerts/54D-66666.jpg', 'pending', 1, NOW() - INTERVAL '4 days' + INTERVAL '13 hours'),
('55E-55555', '/images/alerts/55E-55555.jpg', 'pending', 2, NOW() - INTERVAL '3 days' + INTERVAL '14 hours'),
('56F-44444', '/images/alerts/56F-44444.jpg', 'pending', 3, NOW() - INTERVAL '2 days' + INTERVAL '15 hours'),
('57G-33333', '/images/alerts/57G-33333.jpg', 'pending', 1, NOW() - INTERVAL '9 hours');

-- Insert default admin user with password 'admin123' if not exists
INSERT INTO users (username, password, full_name, role)
VALUES ('admin', '$2b$10$p8TePF9qXVbfE4Q5aJZDvu7Wd5g0zFdOQvKU35c8ZwgTaE.I.tKUi', 'Administrator', 'admin')
ON CONFLICT (username) DO NOTHING; 