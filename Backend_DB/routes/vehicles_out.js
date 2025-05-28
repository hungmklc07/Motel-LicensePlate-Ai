const express = require('express');
const router = express.Router();
const pool = require('../db');

// Ghi nhận xe ra
router.post('/', async (req, res) => {
    const { license_plate, building_id, image_path } = req.body;

    try {
        // Ghi nhận xe ra
        const result = await pool.query(`
            INSERT INTO vehicles_out (license_plate, building_id, image_path)
            VALUES ($1, $2, $3)
            RETURNING *
        `, [license_plate, building_id, image_path]);

        // Kiểm tra xem biển số có phải xe đã đăng ký không
        const vehicleCheck = await pool.query(
            'SELECT * FROM vehicles WHERE license_plate = $1 AND is_active = true',
            [license_plate]
        );

        if (vehicleCheck.rows.length === 0) {
            return res.status(201).json({
                message: 'Đã ghi nhận xe ra',
                warning: 'Xe chưa đăng ký - cần xác minh người điều khiển.',
                data: result.rows[0]
            });
        } else {
            return res.status(201).json({ 
                message: 'Đã ghi nhận xe ra',
                data: result.rows[0]
            });
        }

    } catch (err) {
        console.error('Lỗi ghi nhận xe ra:', err);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi ghi nhận xe ra' });
    }
});

// Lấy danh sách xe ra
router.get('/', async (req, res) => {
    try {
        const { building_id, date } = req.query;
        
        let query = `
            SELECT vo.*, v.owner_name, v.vehicle_type, b.name as building_name
            FROM vehicles_out vo
            LEFT JOIN vehicles v ON vo.license_plate = v.license_plate
            LEFT JOIN buildings b ON vo.building_id = b.id
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;
        
        if (building_id) {
            query += ` AND vo.building_id = $${paramIndex}`;
            params.push(building_id);
            paramIndex++;
        }
        
        if (date) {
            query += ` AND DATE(vo.time_out) = $${paramIndex}`;
            params.push(date);
            paramIndex++;
        }
        
        query += ' ORDER BY vo.time_out DESC';
        
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Lỗi lấy danh sách xe ra:', err);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy danh sách xe ra' });
    }
});

module.exports = router;
