import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { CssBaseline, createTheme, ThemeProvider } from '@mui/material';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import History from './pages/History';
import Alerts from './pages/Alerts';
import Camera from './pages/Camera';
import UploadImage from './pages/UploadImage';
import { authService } from './services/api';

// Tạo theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Kiểm tra người dùng đã đăng nhập chưa
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking authentication for path:', location.pathname);
        
        // Nếu đang ở trang login và đã kiểm tra auth rồi, không cần kiểm tra lại
        if (location.pathname === '/login' && authChecked) {
          console.log('Skipping auth check on login page');
          return;
        }
        
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found, user is not authenticated');
          setAuthenticated(false);
          setUser(null);
          setAuthChecked(true);
          return;
        }

        console.log('Token found, verifying with backend...');
        const response = await authService.checkAuth();
        
        if (response && response.data && response.data.user) {
          console.log('Authentication successful, user:', response.data.user);
          setAuthenticated(true);
          setUser(response.data.user);
        } else {
          console.log('Authentication failed - invalid response');
          localStorage.removeItem('token');
          setAuthenticated(false);
          setUser(null);
          
          // Nếu không phải đang ở trang login, chuyển hướng về login
          if (location.pathname !== '/login') {
            navigate('/login');
          }
        }
      } catch (err) {
        console.error('Authentication error:', err);
        localStorage.removeItem('token');
        setAuthenticated(false);
        setUser(null);
        
        // Nếu không phải đang ở trang login, chuyển hướng về login
        if (location.pathname !== '/login') {
          navigate('/login');
        }
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, [location.pathname, navigate]);

  if (!authChecked && location.pathname !== '/login') {
    // Đang kiểm tra xác thực, hiển thị màn hình loading
    return <div>Đang tải...</div>;
  }

  // HOC PrivateRoute để bảo vệ các routes cần xác thực
  const PrivateRoute = ({ children }) => {
    if (!authChecked) return <div>Đang tải...</div>;
    
    if (!authenticated) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    return children;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={
          authenticated ? <Navigate to="/dashboard" replace /> : <Login />
        } />
        
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        } />
        
        <Route path="/vehicles" element={
          <PrivateRoute>
            <Layout>
              <Vehicles />
            </Layout>
          </PrivateRoute>
        } />
        
        <Route path="/history" element={
          <PrivateRoute>
            <Layout>
              <History />
            </Layout>
          </PrivateRoute>
        } />
        
        <Route path="/alerts" element={
          <PrivateRoute>
            <Layout>
              <Alerts />
            </Layout>
          </PrivateRoute>
        } />
        
        <Route path="/camera" element={          <PrivateRoute>            <Layout>              <Camera />            </Layout>          </PrivateRoute>        } />
        
        <Route path="/upload-image" element={
          <PrivateRoute>
            <Layout>
              <UploadImage />
            </Layout>
          </PrivateRoute>
        } />
        
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App; 