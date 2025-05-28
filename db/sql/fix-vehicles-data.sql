-- Thêm dữ liệu mẫu cho bảng vehicles

-- Xóa dữ liệu cũ nếu có
TRUNCATE vehicles CASCADE;

-- Reset auto-increment counter
ALTER SEQUENCE vehicles_id_seq RESTART WITH 1;

-- Thêm dữ liệu mới
INSERT INTO vehicles (license_plate, owner_name, vehicle_type, building_id, phone_number, is_registered, created_at, updated_at)
VALUES
('59A-12345', 'Nguyễn Văn An', 'Xe máy', 4, NULL, true, NOW(), NOW()),
('59B-23456', 'Trần Thị Bình', 'Xe máy', 4, '0901234567', true, NOW(), NOW()),
('59C-34567', 'Lê Văn Công', 'Ô tô', 4, '0912345678', true, NOW(), NOW()),
('59D-45678', 'Phạm Thị Dung', 'Xe máy', 4, NULL, true, NOW(), NOW()),
('59E-56789', 'Hoàng Văn Em', 'Xe máy', 5, '0923456789', true, NOW(), NOW()),
('59F-67890', 'Ngô Thị Hoa', 'Xe máy', 5, NULL, true, NOW(), NOW()),
('59G-78901', 'Đỗ Văn Giang', 'Ô tô', 5, '0934567890', true, NOW(), NOW()),
('59H-89012', 'Bùi Thị Hương', 'Xe máy', 6, NULL, true, NOW(), NOW()),
('59K-90123', 'Vũ Văn Khoa', 'Xe máy', 6, '0945678901', true, NOW(), NOW()),
('59L-01234', 'Đặng Thị Lan', 'Ô tô', 6, NULL, true, NOW(), NOW()); 