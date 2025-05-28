import React, { useEffect, useState } from 'react';
import { Box, Typography, Select, MenuItem, Button, Card, CardContent } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const API_BASE = process.env.REACT_APP_API_BASE || '';

function Camera() {
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [status, setStatus] = useState('');
  const [snapshotUrl, setSnapshotUrl] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertData, setAlertData] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/cameras`)
      .then(res => res.json())
      .then(data => {
        setCameras(data.cameras || []);
        setStatus(data.status);
        if (data.cameras && data.cameras.length > 0) {
          setSelectedCamera(data.cameras[0]);
        }
      })
      .catch(err => {
        console.error("Error fetching cameras:", err);
        setStatus("Lỗi kết nối");
      });
  }, []);

  useEffect(() => {
    if (selectedCamera) {
      setSnapshotUrl(`${API_BASE}/api/camera/${selectedCamera}/snapshot?${Date.now()}`);
      setStreamUrl(`${API_BASE}/api/camera/${selectedCamera}/stream`);
    }
  }, [selectedCamera]);

  useEffect(() => {
    // Kết nối WebSocket để nhận cảnh báo realtime
    try {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const wsUrl = `${wsProtocol}://${window.location.host}/api/ws/alerts`;
      console.log("Connecting to WebSocket:", wsUrl);
      
      const ws = new window.WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log("WebSocket connection established");
      };
      
      ws.onmessage = (event) => {
        try {
          console.log("WebSocket message received:", event.data);
          const msg = JSON.parse(event.data);
          if (msg.type === 'alert') {
            setAlertData(msg.data);
            setAlertOpen(true);
          }
        } catch (e) {
          console.error("Error parsing WebSocket message:", e);
        }
      };
      
      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
      
      return () => {
        console.log("Closing WebSocket connection");
        ws.close();
      };
    } catch (e) {
      console.error("Error setting up WebSocket:", e);
    }
  }, []);

  const handleCameraChange = (e) => {
    setSelectedCamera(e.target.value);
  };

  const handleRefreshSnapshot = () => {
    setSnapshotUrl(`${API_BASE}/api/camera/${selectedCamera}/snapshot?${Date.now()}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Camera Realtime</Typography>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle1">Trạng thái hệ thống: {status}</Typography>
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
            <Typography>Chọn camera:</Typography>
            <Select
              value={selectedCamera}
              onChange={handleCameraChange}
              sx={{ ml: 2, minWidth: 120 }}
              displayEmpty
            >
              {cameras.length === 0 && (
                <MenuItem value="" disabled>Không có camera</MenuItem>
              )}
              {cameras.map(cam => (
                <MenuItem key={cam} value={cam}>{cam}</MenuItem>
              ))}
            </Select>
          </Box>
        </CardContent>
      </Card>
      {selectedCamera && (
        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h6">Stream realtime</Typography>
            <Box sx={{ border: '1px solid #ccc', mt: 1, width: 480, height: 320, overflow: 'hidden' }}>
              {/* MJPEG stream */}
              <img
                src={streamUrl}
                alt="Camera Stream"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onError={e => { e.target.src = ''; console.error("Error loading stream"); }}
              />
            </Box>
          </Box>
          <Box>
            <Typography variant="h6">Frame mới nhất</Typography>
            <Box sx={{ border: '1px solid #ccc', mt: 1, width: 480, height: 320, overflow: 'hidden', position: 'relative' }}>
              <img
                src={snapshotUrl}
                alt="Snapshot"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onError={e => { e.target.src = ''; console.error("Error loading snapshot"); }}
              />
              <Button
                variant="contained"
                size="small"
                sx={{ position: 'absolute', top: 8, right: 8 }}
                onClick={handleRefreshSnapshot}
              >Làm mới</Button>
            </Box>
          </Box>
        </Box>
      )}
      <Snackbar open={alertOpen} autoHideDuration={8000} onClose={() => setAlertOpen(false)} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <MuiAlert onClose={() => setAlertOpen(false)} severity="warning" sx={{ width: '100%' }}>
          {alertData ? (
            <>
              <b>Xe lạ phát hiện!</b><br />
              Biển số: {alertData.license_plate}<br />
              Vị trí: {alertData.location}<br />
              Tòa nhà: {alertData.building_id}<br />
              {alertData.image_path && (
                <img src={alertData.image_path} alt="alert" style={{ maxWidth: 200, marginTop: 8 }} />
              )}
            </>
          ) : 'Có cảnh báo mới!'}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}

export default Camera; 