import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, CircularProgress, 
  Alert, Card, CardContent, CardHeader, Divider
} from '@mui/material';
import { 
  DirectionsCar as CarIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { vehicleService, historyService, alertService } from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState({
    totalVehicles: 0,
    todayEntries: 0,
    todayExits: 0,
    pendingAlerts: 0,
    recentHistory: [],
    recentAlerts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load dữ liệu thống kê
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Giả lập call API để lấy dữ liệu thống kê
      // Trong thực tế, bạn sẽ gọi đến API endpoint riêng
      
      // 1. Tổng số xe đăng ký
      const vehiclesRes = await vehicleService.getRegisteredVehicles();
      
      // 2. Lấy lịch sử ra vào hôm nay
      const today = new Date().toISOString().split('T')[0];
      const historyRes = await historyService.getVehicleHistory({ 
        startDate: today, 
        endDate: today 
      });
      
      // 3. Lấy cảnh báo chưa xử lý
      const alertsRes = await alertService.getAlerts({ status: 'pending' });
      
      // 4. Lấy lịch sử gần đây nhất
      const recentHistoryRes = await historyService.getVehicleHistory({ limit: 5 });
      
      // Tính toán thống kê
      const todayHistory = historyRes.data.data || [];
      const todayEntries = todayHistory.filter(h => h.direction === 'in').length;
      const todayExits = todayHistory.filter(h => h.direction === 'out').length;
      
      // Cập nhật state
      setStats({
        totalVehicles: vehiclesRes.data.data.length,
        todayEntries,
        todayExits,
        pendingAlerts: alertsRes.data.data.length,
        recentHistory: recentHistoryRes.data.data.slice(0, 5),
        recentAlerts: alertsRes.data.data.slice(0, 3)
      });
      
      setError(null);
    } catch (err) {
      setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Card tổng quan
  const StatCard = ({ icon, title, value, color }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Box
              sx={{
                backgroundColor: `${color}.light`,
                borderRadius: 1,
                p: 1,
                display: 'flex',
              }}
            >
              {React.cloneElement(icon, { 
                sx: { fontSize: 40, color: `${color}.main` } 
              })}
            </Box>
          </Grid>
          <Grid item xs>
            <Typography variant="h6" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h4">
              {value}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h5" component="h1" mb={3}>
        Tổng quan hệ thống
      </Typography>

      {/* Thống kê */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={<CarIcon />} 
            title="Tổng số xe đăng ký" 
            value={stats.totalVehicles} 
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={<TrendingIcon />} 
            title="Xe vào hôm nay" 
            value={stats.todayEntries} 
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={<TrendingIcon />} 
            title="Xe ra hôm nay" 
            value={stats.todayExits} 
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            icon={<WarningIcon />} 
            title="Cảnh báo chưa xử lý" 
            value={stats.pendingAlerts} 
            color="error"
          />
        </Grid>
      </Grid>

      {/* Lịch sử và cảnh báo */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Lịch sử ra vào gần đây
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {stats.recentHistory.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Chưa có dữ liệu lịch sử.
              </Typography>
            ) : (
              stats.recentHistory.map((item, index) => (
                <Box key={item.id || index} mb={2} pb={2} borderBottom={index < stats.recentHistory.length - 1 ? 1 : 0} borderColor="divider">
                  <Grid container>
                    <Grid item xs={12} sm={7}>
                      <Box display="flex" alignItems="center">
                        <CalendarIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                        <Typography variant="body1">
                          {item.licensePlate} - {item.ownerName || 'Không xác định'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">
                        {item.direction === 'in' ? 'Vào' : 'Ra'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <Typography variant="body2" color="text.secondary" align="right">
                        {new Date(item.timestamp).toLocaleTimeString('vi-VN')}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              ))
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Cảnh báo xe lạ mới nhất
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {stats.recentAlerts.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Không có cảnh báo mới.
              </Typography>
            ) : (
              stats.recentAlerts.map((alert, index) => (
                <Box key={alert.id || index} mb={2} pb={2} borderBottom={index < stats.recentAlerts.length - 1 ? 1 : 0} borderColor="divider">
                  <Box display="flex" alignItems="center" mb={1}>
                    <WarningIcon color="error" sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body1">
                      {alert.licensePlate}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(alert.timestamp).toLocaleString('vi-VN')}
                  </Typography>
                </Box>
              ))
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard; 