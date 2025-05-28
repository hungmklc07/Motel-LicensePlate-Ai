const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('./auth');

// Lấy lịch sử ra vào của xe
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { license_plate, building_id, date_from, date_to, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        // Tạo câu truy vấn
        let query = `
            SELECT 
                vi.id as entry_id, 
                vi.license_plate,
                vi.building_id,
                b.name as building_name,
                vi.time_in,
                vo.time_out,
                vi.image_path as entry_image,
                vo.image_path as exit_image,
                v.owner_name,
                v.vehicle_type,
                CASE WHEN v.id IS NULL THEN false ELSE true END as is_registered
            FROM vehicles_in vi
            LEFT JOIN vehicles_out vo ON vi.license_plate = vo.license_plate 
                AND DATE(vi.time_in) = DATE(vo.time_out)
            LEFT JOIN vehicles v ON vi.license_plate = v.license_plate
            LEFT JOIN buildings b ON vi.building_id = b.id
            WHERE 1=1
        `;

        // Tạo câu truy vấn đếm
        let countQuery = `
            SELECT COUNT(*) FROM vehicles_in vi
            LEFT JOIN vehicles_out vo ON vi.license_plate = vo.license_plate 
                AND DATE(vi.time_in) = DATE(vo.time_out)
            WHERE 1=1
        `;

        const params = [];
        let countParams = [];
        let paramIndex = 1;
        let countParamIndex = 1;

        // Filter theo license_plate
        if (license_plate) {
            query += ` AND vi.license_plate = $${paramIndex}`;
            countQuery += ` AND vi.license_plate = $${countParamIndex}`;
            params.push(license_plate);
            countParams.push(license_plate);
            paramIndex++;
            countParamIndex++;
        }

        // Filter theo building_id
        if (building_id) {
            query += ` AND vi.building_id = $${paramIndex}`;
            countQuery += ` AND vi.building_id = $${countParamIndex}`;
            params.push(building_id);
            countParams.push(building_id);
            paramIndex++;
            countParamIndex++;
        } else if (req.user.role === 'building_admin') {
            // Nếu là admin khu, chỉ lấy lịch sử trong khu mình quản lý
            query += ` AND vi.building_id = $${paramIndex}`;
            countQuery += ` AND vi.building_id = $${countParamIndex}`;
            params.push(req.user.building_id);
            countParams.push(req.user.building_id);
            paramIndex++;
            countParamIndex++;
        }

        // Filter theo khoảng thời gian
        if (date_from) {
            query += ` AND DATE(vi.time_in) >= $${paramIndex}`;
            countQuery += ` AND DATE(vi.time_in) >= $${countParamIndex}`;
            params.push(date_from);
            countParams.push(date_from);
            paramIndex++;
            countParamIndex++;
        }

        if (date_to) {
            query += ` AND DATE(vi.time_in) <= $${paramIndex}`;
            countQuery += ` AND DATE(vi.time_in) <= $${countParamIndex}`;
            params.push(date_to);
            countParams.push(date_to);
            paramIndex++;
            countParamIndex++;
        }

        // Sắp xếp và phân trang
        query += ` ORDER BY vi.time_in DESC LIMIT $${paramIndex} OFFSET $${paramIndex+1}`;
        params.push(limit, offset);
        
        // Thực hiện truy vấn
        const result = await pool.query(query, params);
        const countResult = await pool.query(countQuery, countParams);
        
        const totalItems = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalItems / limit);

        res.json({
            data: result.rows,
            pagination: {
                totalItems,
                totalPages,
                currentPage: parseInt(page),
                pageSize: parseInt(limit)
            }
        });
    } catch (err) {
        console.error('Lỗi lấy lịch sử ra vào:', err);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy lịch sử ra vào' });
    }
});

// Lấy thống kê lượng xe ra vào theo ngày
router.get('/stats/daily', authenticateToken, async (req, res) => {
    try {
        const { building_id, date_from, date_to } = req.query;
        
        // Mặc định lấy 7 ngày gần nhất nếu không có tham số
        const endDate = date_to ? new Date(date_to) : new Date();
        const startDate = date_from 
            ? new Date(date_from) 
            : new Date(endDate.getTime() - 6 * 24 * 60 * 60 * 1000);
        
        let query = `
            WITH days AS (
                SELECT generate_series(
                    $1::timestamp, 
                    $2::timestamp, 
                    '1 day'::interval
                )::date AS day
            ),
            vehicles_in_count AS (
                SELECT 
                    DATE(time_in) as day, 
                    COUNT(*) as count
                FROM vehicles_in
                WHERE DATE(time_in) BETWEEN $1 AND $2
        `;
        
        let vehicles_out_query = `
            ),
            vehicles_out_count AS (
                SELECT 
                    DATE(time_out) as day, 
                    COUNT(*) as count
                FROM vehicles_out
                WHERE DATE(time_out) BETWEEN $1 AND $2
        `;
        
        const params = [startDate, endDate];
        let paramIndex = 3;
        
        // Filter theo building_id
        if (building_id) {
            query += ` AND building_id = $${paramIndex}`;
            vehicles_out_query += ` AND building_id = $${paramIndex}`;
            params.push(building_id);
            paramIndex++;
        } else if (req.user.role === 'building_admin') {
            query += ` AND building_id = $${paramIndex}`;
            vehicles_out_query += ` AND building_id = $${paramIndex}`;
            params.push(req.user.building_id);
            paramIndex++;
        }
        
        query += ` GROUP BY day`;
        vehicles_out_query += ` GROUP BY day`;
        
        const finalQuery = query + vehicles_out_query + `
            )
            SELECT 
                d.day,
                COALESCE(vi.count, 0) as vehicles_in,
                COALESCE(vo.count, 0) as vehicles_out
            FROM days d
            LEFT JOIN vehicles_in_count vi ON d.day = vi.day
            LEFT JOIN vehicles_out_count vo ON d.day = vo.day
            ORDER BY d.day
        `;
        
        const result = await pool.query(finalQuery, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Lỗi lấy thống kê xe ra vào theo ngày:', err);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy thống kê xe ra vào theo ngày' });
    }
});

module.exports = router;

