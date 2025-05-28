import React, { useState, useEffect } from 'react';
import { 
  Box, Button, Container, TextField, Typography, 
  Paper, Alert, CircularProgress 
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Kiểm tra nếu đã có token, chuyển hướng ngay lập tức
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Token exists on login page, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with username:', formData.username);
      
      // Đảm bảo xóa token cũ trước khi đăng nhập
      localStorage.removeItem('token');
      
      const response = await authService.login(formData);
      console.log('Login successful, status:', response.status);
      
      // Lưu token vào localStorage
      if (response.data && response.data.token) {
        console.log('Saving token and user data');
        localStorage.setItem('token', response.data.token);
        
        // Thêm delay nhỏ trước khi chuyển hướng để đảm bảo token được lưu
        setTimeout(() => {
          const from = location.state?.from?.pathname || '/dashboard';
          console.log('Redirecting to:', from);
          navigate(from, { replace: true });
        }, 100);
      } else {
        throw new Error('Token not received from server');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message || 
        err.message ||
        'Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.'
      );
      // Đảm bảo token được xóa nếu đăng nhập thất bại
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            ĐĂNG NHẬP QUẢN TRỊ
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Tên đăng nhập"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mật khẩu"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Đăng nhập'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login; 