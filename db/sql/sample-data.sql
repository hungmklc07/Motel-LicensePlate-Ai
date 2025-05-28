-- Sample data for the license plate recognition system
-- This script adds sample buildings, vehicles, entry/exit records, and alerts

-- Clean up existing data first
TRUNCATE vehicles_out, vehicles_in, alerts, vehicles CASCADE;
TRUNCATE buildings CASCADE;

-- Reset sequences
ALTER SEQUENCE buildings_id_seq RESTART WITH 1;
ALTER SEQUENCE vehicles_id_seq RESTART WITH 1;
ALTER SEQUENCE vehicles_in_id_seq RESTART WITH 1;
ALTER SEQUENCE vehicles_out_id_seq RESTART WITH 1;
ALTER SEQUENCE alerts_id_seq RESTART WITH 1;

-- Sample buildings
INSERT INTO buildings (name, address, created_at) VALUES
('Khu nhà trọ A', 'Số 123 Đường Nguyễn Văn A, Quận 1, TP.HCM', NOW() - INTERVAL '30 days'),
('Khu nhà trọ B', 'Số 456 Đường Lê Văn B, Quận 2, TP.HCM', NOW() - INTERVAL '28 days'),
('Khu nhà trọ C', 'Số 789 Đường Trần Văn C, Quận 3, TP.HCM', NOW() - INTERVAL '25 days');

-- Sample vehicles
INSERT INTO vehicles (license_plate, owner_name, vehicle_type, building_id, notes, created_at) VALUES
-- Khu A
('59A-12345', 'Nguyễn Văn An', 'Xe máy', 1, 'Honda Wave Alpha màu đỏ', NOW() - INTERVAL '29 days'),
('59B-23456', 'Trần Thị Bình', 'Xe máy', 1, 'Yamaha Sirius màu xanh', NOW() - INTERVAL '28 days'),
('59C-34567', 'Lê Văn Công', 'Ô tô', 1, 'Toyota Vios màu trắng', NOW() - INTERVAL '27 days'),
('59D-45678', 'Phạm Thị Dung', 'Xe máy', 1, 'Honda Vision màu đen', NOW() - INTERVAL '26 days'),
-- Khu B
('59E-56789', 'Hoàng Văn Em', 'Xe máy', 2, 'Suzuki Raider màu đỏ', NOW() - INTERVAL '25 days'),
('59F-67890', 'Ngô Thị Hoa', 'Xe máy', 2, 'Honda SH màu đen', NOW() - INTERVAL '24 days'),
('59G-78901', 'Đỗ Văn Giang', 'Ô tô', 2, 'Mazda 3 màu xanh', NOW() - INTERVAL '23 days'),
-- Khu C
('59H-89012', 'Bùi Thị Hương', 'Xe máy', 3, 'Piaggio Liberty màu trắng', NOW() - INTERVAL '22 days'),
('59K-90123', 'Vũ Văn Khoa', 'Xe máy', 3, 'Honda Air Blade màu xám', NOW() - INTERVAL '21 days'),
('59L-01234', 'Đặng Thị Lan', 'Ô tô', 3, 'Hyundai Accent màu đỏ', NOW() - INTERVAL '20 days');

-- Sample vehicles_in (entry records) - last 7 days
-- Day 1
INSERT INTO vehicles_in (license_plate, building_id, time_in, image_path) VALUES
('59A-12345', 1, NOW() - INTERVAL '7 days' + INTERVAL '7 hours', '/images/entries/59A-12345_1.jpg'),
('59B-23456', 1, NOW() - INTERVAL '7 days' + INTERVAL '8 hours', '/images/entries/59B-23456_1.jpg'),
('59E-56789', 2, NOW() - INTERVAL '7 days' + INTERVAL '9 hours', '/images/entries/59E-56789_1.jpg'),
('59H-89012', 3, NOW() - INTERVAL '7 days' + INTERVAL '10 hours', '/images/entries/59H-89012_1.jpg');

-- Day 2
INSERT INTO vehicles_in (license_plate, building_id, time_in, image_path) VALUES
('59C-34567', 1, NOW() - INTERVAL '6 days' + INTERVAL '7 hours', '/images/entries/59C-34567_1.jpg'),
('59F-67890', 2, NOW() - INTERVAL '6 days' + INTERVAL '8 hours', '/images/entries/59F-67890_1.jpg'),
('59K-90123', 3, NOW() - INTERVAL '6 days' + INTERVAL '9 hours', '/images/entries/59K-90123_1.jpg');

-- Day 3
INSERT INTO vehicles_in (license_plate, building_id, time_in, image_path) VALUES
('59A-12345', 1, NOW() - INTERVAL '5 days' + INTERVAL '7 hours', '/images/entries/59A-12345_2.jpg'),
('59D-45678', 1, NOW() - INTERVAL '5 days' + INTERVAL '8 hours', '/images/entries/59D-45678_1.jpg'),
('59G-78901', 2, NOW() - INTERVAL '5 days' + INTERVAL '9 hours', '/images/entries/59G-78901_1.jpg'),
('59L-01234', 3, NOW() - INTERVAL '5 days' + INTERVAL '10 hours', '/images/entries/59L-01234_1.jpg');

-- Day 4
INSERT INTO vehicles_in (license_plate, building_id, time_in, image_path) VALUES
('59B-23456', 1, NOW() - INTERVAL '4 days' + INTERVAL '7 hours', '/images/entries/59B-23456_2.jpg'),
('59E-56789', 2, NOW() - INTERVAL '4 days' + INTERVAL '8 hours', '/images/entries/59E-56789_2.jpg'),
('59H-89012', 3, NOW() - INTERVAL '4 days' + INTERVAL '9 hours', '/images/entries/59H-89012_2.jpg');

-- Day 5
INSERT INTO vehicles_in (license_plate, building_id, time_in, image_path) VALUES
('59A-12345', 1, NOW() - INTERVAL '3 days' + INTERVAL '7 hours', '/images/entries/59A-12345_3.jpg'),
('59C-34567', 1, NOW() - INTERVAL '3 days' + INTERVAL '8 hours', '/images/entries/59C-34567_2.jpg'),
('59F-67890', 2, NOW() - INTERVAL '3 days' + INTERVAL '9 hours', '/images/entries/59F-67890_2.jpg'),
('59K-90123', 3, NOW() - INTERVAL '3 days' + INTERVAL '10 hours', '/images/entries/59K-90123_2.jpg');

-- Day 6
INSERT INTO vehicles_in (license_plate, building_id, time_in, image_path) VALUES
('59B-23456', 1, NOW() - INTERVAL '2 days' + INTERVAL '7 hours', '/images/entries/59B-23456_3.jpg'),
('59D-45678', 1, NOW() - INTERVAL '2 days' + INTERVAL '8 hours', '/images/entries/59D-45678_2.jpg'),
('59G-78901', 2, NOW() - INTERVAL '2 days' + INTERVAL '9 hours', '/images/entries/59G-78901_2.jpg'),
('59L-01234', 3, NOW() - INTERVAL '2 days' + INTERVAL '10 hours', '/images/entries/59L-01234_2.jpg');

-- Day 7 (today)
INSERT INTO vehicles_in (license_plate, building_id, time_in, image_path) VALUES
('59A-12345', 1, NOW() - INTERVAL '8 hours', '/images/entries/59A-12345_4.jpg'),
('59C-34567', 1, NOW() - INTERVAL '7 hours', '/images/entries/59C-34567_3.jpg'),
('59E-56789', 2, NOW() - INTERVAL '6 hours', '/images/entries/59E-56789_3.jpg'),
('59H-89012', 3, NOW() - INTERVAL '5 hours', '/images/entries/59H-89012_3.jpg');

-- Sample vehicles_out (exit records)
-- Day 1
INSERT INTO vehicles_out (license_plate, building_id, time_out, image_path) VALUES
('59A-12345', 1, NOW() - INTERVAL '7 days' + INTERVAL '17 hours', '/images/exits/59A-12345_1.jpg'),
('59B-23456', 1, NOW() - INTERVAL '7 days' + INTERVAL '18 hours', '/images/exits/59B-23456_1.jpg'),
('59E-56789', 2, NOW() - INTERVAL '7 days' + INTERVAL '19 hours', '/images/exits/59E-56789_1.jpg'),
('59H-89012', 3, NOW() - INTERVAL '7 days' + INTERVAL '20 hours', '/images/exits/59H-89012_1.jpg');

-- Day 2
INSERT INTO vehicles_out (license_plate, building_id, time_out, image_path) VALUES
('59C-34567', 1, NOW() - INTERVAL '6 days' + INTERVAL '17 hours', '/images/exits/59C-34567_1.jpg'),
('59F-67890', 2, NOW() - INTERVAL '6 days' + INTERVAL '18 hours', '/images/exits/59F-67890_1.jpg'),
('59K-90123', 3, NOW() - INTERVAL '6 days' + INTERVAL '19 hours', '/images/exits/59K-90123_1.jpg');

-- Day 3
INSERT INTO vehicles_out (license_plate, building_id, time_out, image_path) VALUES
('59A-12345', 1, NOW() - INTERVAL '5 days' + INTERVAL '17 hours', '/images/exits/59A-12345_2.jpg'),
('59D-45678', 1, NOW() - INTERVAL '5 days' + INTERVAL '18 hours', '/images/exits/59D-45678_1.jpg'),
('59G-78901', 2, NOW() - INTERVAL '5 days' + INTERVAL '19 hours', '/images/exits/59G-78901_1.jpg'),
('59L-01234', 3, NOW() - INTERVAL '5 days' + INTERVAL '20 hours', '/images/exits/59L-01234_1.jpg');

-- Day 4
INSERT INTO vehicles_out (license_plate, building_id, time_out, image_path) VALUES
('59B-23456', 1, NOW() - INTERVAL '4 days' + INTERVAL '17 hours', '/images/exits/59B-23456_2.jpg'),
('59E-56789', 2, NOW() - INTERVAL '4 days' + INTERVAL '18 hours', '/images/exits/59E-56789_2.jpg'),
('59H-89012', 3, NOW() - INTERVAL '4 days' + INTERVAL '19 hours', '/images/exits/59H-89012_2.jpg');

-- Day 5
INSERT INTO vehicles_out (license_plate, building_id, time_out, image_path) VALUES
('59A-12345', 1, NOW() - INTERVAL '3 days' + INTERVAL '17 hours', '/images/exits/59A-12345_3.jpg'),
('59C-34567', 1, NOW() - INTERVAL '3 days' + INTERVAL '18 hours', '/images/exits/59C-34567_2.jpg'),
('59F-67890', 2, NOW() - INTERVAL '3 days' + INTERVAL '19 hours', '/images/exits/59F-67890_2.jpg'),
('59K-90123', 3, NOW() - INTERVAL '3 days' + INTERVAL '20 hours', '/images/exits/59K-90123_2.jpg');

-- Day 6
INSERT INTO vehicles_out (license_plate, building_id, time_out, image_path) VALUES
('59B-23456', 1, NOW() - INTERVAL '2 days' + INTERVAL '17 hours', '/images/exits/59B-23456_3.jpg'),
('59D-45678', 1, NOW() - INTERVAL '2 days' + INTERVAL '18 hours', '/images/exits/59D-45678_2.jpg'),
('59G-78901', 2, NOW() - INTERVAL '2 days' + INTERVAL '19 hours', '/images/exits/59G-78901_2.jpg'),
('59L-01234', 3, NOW() - INTERVAL '2 days' + INTERVAL '20 hours', '/images/exits/59L-01234_2.jpg');

-- Some vehicles entered today but haven't exited yet
-- Others already exited
INSERT INTO vehicles_out (license_plate, building_id, time_out, image_path) VALUES
('59A-12345', 1, NOW() - INTERVAL '2 hours', '/images/exits/59A-12345_4.jpg'),
('59E-56789', 2, NOW() - INTERVAL '1 hour', '/images/exits/59E-56789_3.jpg');

-- Sample alerts (unregistered vehicles)
INSERT INTO alerts (license_plate, building_id, image_path, status, notes, timestamp) VALUES
('51A-99999', 1, '/images/alerts/51A-99999.jpg', 'unprocessed', NULL, NOW() - INTERVAL '7 days' + INTERVAL '10 hours'),
('52B-88888', 2, '/images/alerts/52B-88888.jpg', 'unprocessed', NULL, NOW() - INTERVAL '6 days' + INTERVAL '11 hours'),
('53C-77777', 3, '/images/alerts/53C-77777.jpg', 'unprocessed', NULL, NOW() - INTERVAL '5 days' + INTERVAL '12 hours'),
('54D-66666', 1, '/images/alerts/54D-66666.jpg', 'unprocessed', NULL, NOW() - INTERVAL '4 days' + INTERVAL '13 hours'),
('55E-55555', 2, '/images/alerts/55E-55555.jpg', 'unprocessed', NULL, NOW() - INTERVAL '3 days' + INTERVAL '14 hours'),
('56F-44444', 3, '/images/alerts/56F-44444.jpg', 'unprocessed', NULL, NOW() - INTERVAL '2 days' + INTERVAL '15 hours'),
('57G-33333', 1, '/images/alerts/57G-33333.jpg', 'unprocessed', NULL, NOW() - INTERVAL '9 hours');

-- Sample processed alerts
INSERT INTO alerts (license_plate, building_id, image_path, status, notes, timestamp) VALUES
('58H-22222', 2, '/images/alerts/58H-22222.jpg', 'processed', 'Xe của khách đến thăm, đã xác nhận', NOW() - INTERVAL '6 days' + INTERVAL '9 hours'),
('59J-11111', 3, '/images/alerts/59J-11111.jpg', 'processed', 'Xe của nhân viên giao hàng', NOW() - INTERVAL '4 days' + INTERVAL '8 hours'),
('60K-00000', 1, '/images/alerts/60K-00000.jpg', 'processed', 'Xe taxi đón khách', NOW() - INTERVAL '2 days' + INTERVAL '7 hours'); 