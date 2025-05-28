const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('./auth');

// Lấy danh sách cảnh báo
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, buildingId, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT a.*, b.name as building_name 
      FROM alerts a
      LEFT JOIN buildings b ON a.building_id = b.id
      WHERE 1=1
    `;
    let countQuery = `SELECT COUNT(*) FROM alerts a WHERE 1=1`;
    const params = [];
    let paramIndex = 1;
    
    // Filter theo buildingId hoặc quyền truy cập
    if (req.user.role === 'building_admin') {
      // Admin khu chỉ thấy cảnh báo trong khu mình
      query += ` AND a.building_id = $${paramIndex}`;
      countQuery += ` AND a.building_id = $${paramIndex}`;
      params.push(req.user.building_id);
      paramIndex++;
    } else if (buildingId) {
      // Super admin có thể filter theo khu
      query += ` AND a.building_id = $${paramIndex}`;
      countQuery += ` AND a.building_id = $${paramIndex}`;
      params.push(buildingId);
      paramIndex++;
    }
    
    // Filter theo trạng thái
    if (status) {
      query += ` AND a.status = $${paramIndex}`;
      countQuery += ` AND a.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    // Sắp xếp và phân trang
    query += ` ORDER BY a.timestamp DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    
    const alerts = await pool.query(query, params);
    const count = await pool.query(countQuery, params.slice(0, paramIndex - 1));
    
    res.json({
      data: alerts.rows,
      totalItems: parseInt(count.rows[0].count),
      totalPages: Math.ceil(parseInt(count.rows[0].count) / limit),
      currentPage: parseInt(page)
    });
  } catch (err) {
    console.error('Lỗi lấy danh sách cảnh báo:', err);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy danh sách cảnh báo' });
  }
});

// Lấy thông tin chi tiết cảnh báo
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const alertId = req.params.id;
    
    const result = await pool.query(`
      SELECT a.*, b.name as building_name 
      FROM alerts a
      LEFT JOIN buildings b ON a.building_id = b.id
      WHERE a.id = $1
    `, [alertId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy cảnh báo' });
    }
    
    const alert = result.rows[0];
    
    // Kiểm tra quyền truy cập
    if (req.user.role === 'building_admin' && req.user.building_id !== alert.building_id) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }
    
    res.json(alert);
  } catch (err) {
    console.error('Lỗi lấy thông tin cảnh báo:', err);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy thông tin cảnh báo' });
  }
});

// Tạo cảnh báo mới
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { license_plate, location, building_id, image_path, notes } = req.body;
    
    if (!license_plate) {
      return res.status(400).json({ message: 'Biển số xe là bắt buộc' });
    }
    
    // Kiểm tra xem biển số có phải xe lạ không
    const vehicleCheck = await pool.query(
      'SELECT * FROM vehicles WHERE license_plate = $1 AND is_active = true',
      [license_plate]
    );
    
    // Nếu là xe đã đăng ký, không tạo cảnh báo
    if (vehicleCheck.rows.length > 0) {
      return res.status(400).json({ 
        message: 'Xe này đã được đăng ký, không cần tạo cảnh báo' 
      });
    }
    
    // Tạo cảnh báo mới
    const result = await pool.query(
      'INSERT INTO alerts (license_plate, location, building_id, image_path, status, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [license_plate, location, building_id, image_path, 'pending', notes || '']
    );
    const newAlert = result.rows[0];
    // Phát sự kiện socket.io nếu có
    const io = req.app.get('io');
    if (io) io.emit('new_alert', newAlert);
    res.status(201).json(newAlert);
  } catch (err) {
    console.error('Lỗi tạo cảnh báo:', err);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi tạo cảnh báo' });
  }
});

// Cập nhật trạng thái cảnh báo
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const alertId = req.params.id;
    const { status, notes } = req.body;
    
    // Lấy thông tin cảnh báo hiện tại
    const alertCheck = await pool.query('SELECT * FROM alerts WHERE id = $1', [alertId]);
    
    if (alertCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy cảnh báo' });
    }
    
    const alert = alertCheck.rows[0];
    
    // Kiểm tra quyền truy cập
    if (req.user.role === 'building_admin' && req.user.building_id !== alert.building_id) {
      return res.status(403).json({ message: 'Không có quyền chỉnh sửa cảnh báo này' });
    }
    
    // Cập nhật cảnh báo
    const result = await pool.query(`
      UPDATE alerts 
      SET status = $1, notes = $2
      WHERE id = $3
      RETURNING *
    `, [status || alert.status, notes, alertId]);
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Lỗi cập nhật cảnh báo:', err);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật cảnh báo' });
  }
});

// Xóa cảnh báo
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const alertId = req.params.id;
    
    // Lấy thông tin cảnh báo hiện tại
    const alertCheck = await pool.query('SELECT * FROM alerts WHERE id = $1', [alertId]);
    
    if (alertCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy cảnh báo' });
    }
    
    const alert = alertCheck.rows[0];
    
    // Kiểm tra quyền truy cập
    if (req.user.role === 'building_admin' && req.user.building_id !== alert.building_id) {
      return res.status(403).json({ message: 'Không có quyền xóa cảnh báo này' });
    }
    
    // Xóa cảnh báo
    await pool.query('DELETE FROM alerts WHERE id = $1', [alertId]);
    
    res.json({ message: 'Xóa cảnh báo thành công' });
  } catch (err) {
    console.error('Lỗi xóa cảnh báo:', err);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi xóa cảnh báo' });
  }
});

// Lấy thống kê cảnh báo
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const { buildingId } = req.query;
    
    let query = `
      SELECT 
        COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count,
        COUNT(*) as total_count
      FROM alerts
      WHERE 1=1
    `;
    const params = [];
    
    // Filter theo buildingId hoặc quyền truy cập
    if (req.user.role === 'building_admin') {
      query += ` AND building_id = $1`;
      params.push(req.user.building_id);
    } else if (buildingId) {
      query += ` AND building_id = $1`;
      params.push(buildingId);
    }
    
    const result = await pool.query(query, params);
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Lỗi lấy thống kê cảnh báo:', err);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy thống kê cảnh báo' });
  }
});

module.exports = router; 