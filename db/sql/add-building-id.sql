-- Thêm cột building_id vào bảng vehicles_in nếu chưa tồn tại
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'vehicles_in' AND column_name = 'building_id'
    ) THEN
        ALTER TABLE vehicles_in ADD COLUMN building_id INTEGER REFERENCES buildings(id);
    END IF;
END
$$;

-- Thêm cột building_id vào bảng vehicles_out nếu chưa tồn tại
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'vehicles_out' AND column_name = 'building_id'
    ) THEN
        ALTER TABLE vehicles_out ADD COLUMN building_id INTEGER REFERENCES buildings(id);
    END IF;
END
$$;

-- Cập nhật dữ liệu building_id từ bảng vehicles cho các entry đã có
UPDATE vehicles_in vi
SET building_id = v.building_id
FROM vehicles v
WHERE vi.license_plate = v.license_plate
AND vi.building_id IS NULL;

-- Cập nhật dữ liệu building_id từ bảng vehicles cho các exit đã có
UPDATE vehicles_out vo
SET building_id = v.building_id
FROM vehicles v
WHERE vo.license_plate = v.license_plate
AND vo.building_id IS NULL; 