const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('./auth');

// Middleware kiểm tra quyền super_admin
const checkSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Không có quyền truy cập' });
  }
  next();
};

// Lấy danh sách tất cả khu nhà trọ
router.get('/', authenticateToken, async (req, res) => {
  try {
    let query = 'SELECT * FROM buildings';
    let params = [];
    
    // Nếu là admin khu, chỉ lấy khu nhà trọ đang quản lý
    if (req.user.role === 'building_admin') {
      query += ' WHERE id = $1';
      params.push(req.user.building_id);
    }
    
    query += ' ORDER BY name';
    const result = await pool.query(query, params);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Lỗi lấy danh sách khu nhà trọ:', err);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy danh sách khu nhà trọ' });
  }
});

// Lấy thông tin chi tiết khu nhà trọ
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const buildingId = req.params.id;
    
    // Kiểm tra quyền truy cập
    if (req.user.role === 'building_admin' && req.user.building_id !== parseInt(buildingId)) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }
    
    const result = await pool.query('SELECT * FROM buildings WHERE id = $1', [buildingId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy khu nhà trọ' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Lỗi lấy thông tin khu nhà trọ:', err);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy thông tin khu nhà trọ' });
  }
});

// Tạo khu nhà trọ mới (chỉ super_admin)
router.post('/', authenticateToken, checkSuperAdmin, async (req, res) => {
  try {
    const { name, address } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Tên khu nhà trọ là bắt buộc' });
    }
    
    const result = await pool.query(
      'INSERT INTO buildings (name, address) VALUES ($1, $2) RETURNING *',
      [name, address]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Lỗi tạo khu nhà trọ:', err);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi tạo khu nhà trọ' });
  }
});

// Cập nhật khu nhà trọ (chỉ super_admin)
router.put('/:id', authenticateToken, checkSuperAdmin, async (req, res) => {
  try {
    const buildingId = req.params.id;
    const { name, address } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Tên khu nhà trọ là bắt buộc' });
    }
    
    const result = await pool.query(
      'UPDATE buildings SET name = $1, address = $2 WHERE id = $3 RETURNING *',
      [name, address, buildingId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy khu nhà trọ' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Lỗi cập nhật khu nhà trọ:', err);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật khu nhà trọ' });
  }
});

// Xóa khu nhà trọ (chỉ super_admin)
router.delete('/:id', authenticateToken, checkSuperAdmin, async (req, res) => {
  try {
    const buildingId = req.params.id;
    
    // Kiểm tra xem có xe đăng ký trong khu này không
    const vehiclesCheck = await pool.query(
      'SELECT COUNT(*) FROM vehicles WHERE building_id = $1',
      [buildingId]
    );
    
    if (parseInt(vehiclesCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        message: 'Không thể xóa khu nhà trọ vì còn xe đăng ký trong khu này' 
      });
    }
    
    // Kiểm tra xem có admin quản lý khu này không
    const adminsCheck = await pool.query(
      'SELECT COUNT(*) FROM users WHERE building_id = $1',
      [buildingId]
    );
    
    if (parseInt(adminsCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        message: 'Không thể xóa khu nhà trọ vì còn người quản lý khu này' 
      });
    }
    
    const result = await pool.query(
      'DELETE FROM buildings WHERE id = $1 RETURNING *',
      [buildingId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy khu nhà trọ' });
    }
    
    res.json({ message: 'Xóa khu nhà trọ thành công' });
  } catch (err) {
    console.error('Lỗi xóa khu nhà trọ:', err);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi xóa khu nhà trọ' });
  }
});

// Lấy thống kê khu nhà trọ
router.get('/:id/stats', authenticateToken, async (req, res) => {
  try {
    const buildingId = req.params.id;
    
    // Kiểm tra quyền truy cập
    if (req.user.role === 'building_admin' && req.user.building_id !== parseInt(buildingId)) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }
    
    // Số lượng xe đăng ký
    const registeredVehicles = await pool.query(
      'SELECT COUNT(*) FROM vehicles WHERE building_id = $1',
      [buildingId]
    );
    
    // Số lượng xe vào hôm nay
    const today = new Date().toISOString().split('T')[0];
    const vehiclesInToday = await pool.query(
      "SELECT COUNT(*) FROM vehicles_in WHERE building_id = $1 AND DATE(time_in) = $2",
      [buildingId, today]
    );
    
    // Số lượng xe ra hôm nay
    const vehiclesOutToday = await pool.query(
      "SELECT COUNT(*) FROM vehicles_out WHERE building_id = $1 AND DATE(time_out) = $2",
      [buildingId, today]
    );
    
    res.json({
      registeredVehicles: parseInt(registeredVehicles.rows[0].count),
      vehiclesInToday: parseInt(vehiclesInToday.rows[0].count),
      vehiclesOutToday: parseInt(vehiclesOutToday.rows[0].count)
    });
  } catch (err) {
    console.error('Lỗi lấy thống kê khu nhà trọ:', err);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy thống kê khu nhà trọ' });
  }
});

module.exports = router; 