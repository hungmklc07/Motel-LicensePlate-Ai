import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Typography, Paper, Grid, CircularProgress, 
  Alert, Button, Dialog, DialogActions, DialogContent, 
  DialogTitle, TextField, Snackbar, Card, CardContent,
  CardMedia, CardActions, Chip, Stack, Divider
} from '@mui/material';
import { 
  Delete as DeleteIcon,
  Check as CheckIcon,
  Block as BlockIcon,
  Note as NoteIcon
} from '@mui/icons-material';
import { alertService } from '../services/api';
import io from 'socket.io-client';
const API_BASE = '/api';

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentAlert, setCurrentAlert] = useState(null);
  const [notes, setNotes] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const socketRef = useRef();

  // Load dữ liệu cảnh báo
  useEffect(() => {
    fetchAlerts();
  }, []);

  useEffect(() => {
    socketRef.current = io(API_BASE);
    socketRef.current.on('new_alert', (alert) => {
      setSnackbar({
        open: true,
        message: `Cảnh báo xe lạ: ${alert.license_plate}`,
        severity: 'warning'
      });
      // Optionally: cập nhật danh sách alerts nếu muốn realtime
      setAlerts(prev => [alert, ...prev]);
    });
    return () => { socketRef.current.disconnect(); };
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const response = await alertService.getAlerts({ status: 'pending' });
      setAlerts(response.data.data);
      setError(null);
    } catch (err) {
      setError('Không thể tải cảnh báo. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý Dialog ghi chú
  const handleOpenDialog = (alert) => {
    setCurrentAlert(alert);
    setNotes(alert.notes || '');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };

  const handleSaveNotes = async () => {
    try {
      await alertService.processAlert(currentAlert.id, {
        notes,
        status: currentAlert.status, // Giữ nguyên trạng thái
      });
      
      // Cập nhật lại danh sách cảnh báo
      const updatedAlerts = alerts.map(alert => 
        alert.id === currentAlert.id ? { ...alert, notes } : alert
      );
      setAlerts(updatedAlerts);
      
      setSnackbar({
        open: true,
        message: 'Đã lưu ghi chú thành công',
        severity: 'success'
      });
      
      handleCloseDialog();
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Không thể lưu ghi chú. Vui lòng thử lại.',
        severity: 'error'
      });
    }
  };

  // Xử lý cảnh báo
  const handleProcessAlert = async (id, status) => {
    try {
      await alertService.processAlert(id, { status });
      
      // Cập nhật lại danh sách (ẩn item đã xử lý)
      const updatedAlerts = alerts.filter(alert => alert.id !== id);
      setAlerts(updatedAlerts);
      
      setSnackbar({
        open: true,
        message: status === 'approved' 
          ? 'Đã phê duyệt cảnh báo' 
          : 'Đã từ chối cảnh báo',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Không thể xử lý cảnh báo. Vui lòng thử lại.',
        severity: 'error'
      });
    }
  };

  const handleDeleteAlert = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa cảnh báo này không?')) {
      try {
        await alertService.deleteAlert(id);
        
        // Cập nhật lại danh sách
        const updatedAlerts = alerts.filter(alert => alert.id !== id);
        setAlerts(updatedAlerts);
        
        setSnackbar({
          open: true,
          message: 'Đã xóa cảnh báo',
          severity: 'success'
        });
      } catch (err) {
        setSnackbar({
          open: true,
          message: 'Không thể xóa cảnh báo. Vui lòng thử lại.',
          severity: 'error'
        });
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <Box>
      <Typography variant="h5" component="h1" mb={3}>
        Cảnh báo xe lạ
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      ) : alerts.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>Không có cảnh báo xe lạ nào cần xử lý</Alert>
      ) : (
        <Grid container spacing={3}>
          {alerts.map((alert) => (
            <Grid item xs={12} sm={6} md={4} key={alert.id}>
              <Card elevation={3}>
                <CardMedia
                  component="img"
                  height="200"
                  image={alert.imageUrl || 'https://via.placeholder.com/400x200?text=Hình+ảnh+xe'}
                  alt={`Xe biển số ${alert.licensePlate}`}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="div">
                    Biển số: {alert.licensePlate}
                  </Typography>
                  
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mb: 2 }}
                  >
                    <Chip 
                      label="Xe lạ" 
                      color="error" 
                      size="small" 
                    />
                  </Stack>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Thời gian:</strong> {new Date(alert.timestamp).toLocaleString('vi-VN')}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Vị trí:</strong> {alert.location}
                  </Typography>
                  
                  {alert.notes && (
                    <>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        <strong>Ghi chú:</strong> {alert.notes}
                      </Typography>
                    </>
                  )}
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Box>
                    <Button 
                      size="small" 
                      startIcon={<CheckIcon />} 
                      color="success"
                      onClick={() => handleProcessAlert(alert.id, 'approved')}
                    >
                      Phê duyệt
                    </Button>
                    <Button 
                      size="small" 
                      startIcon={<BlockIcon />} 
                      color="error"
                      onClick={() => handleProcessAlert(alert.id, 'rejected')}
                    >
                      Từ chối
                    </Button>
                  </Box>
                  
                  <Box>
                    <Button 
                      size="small"
                      startIcon={<NoteIcon />}
                      onClick={() => handleOpenDialog(alert)}
                    >
                      Ghi chú
                    </Button>
                    <Button 
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteAlert(alert.id)}
                    >
                      Xóa
                    </Button>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog ghi chú */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Thêm ghi chú cho cảnh báo</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Ghi chú"
            fullWidth
            multiline
            rows={4}
            value={notes}
            onChange={handleNotesChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSaveNotes} variant="contained">Lưu</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar thông báo */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Alerts; 