import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Card, CardContent, CircularProgress } from '@mui/material';

const API_BASE = process.env.REACT_APP_API_BASE || '';

function UploadImage() {
  const [file, setFile] = useState(null);
  const [location, setLocation] = useState('Test');
  const [buildingId, setBuildingId] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('location', location);
    formData.append('building_id', buildingId);

    try {
      const res = await fetch(`${API_BASE}/api/recognize`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ success: false, message: 'Lỗi kết nối server!' });
    }
    setLoading(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Nhận diện biển số từ ảnh</Typography>
      <Card sx={{ mb: 2, maxWidth: 500 }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ marginBottom: 16 }}
            />
            <TextField
              label="Vị trí"
              value={location}
              onChange={e => setLocation(e.target.value)}
              sx={{ mb: 2, width: '100%' }}
            />
            <TextField
              label="Building ID"
              type="number"
              value={buildingId}
              onChange={e => setBuildingId(e.target.value)}
              sx={{ mb: 2, width: '100%' }}
            />
            <Button type="submit" variant="contained" disabled={loading || !file}>
              {loading ? <CircularProgress size={24} /> : 'Nhận diện'}
            </Button>
          </form>
        </CardContent>
      </Card>
      {result && (
        <Card sx={{ maxWidth: 500 }}>
          <CardContent>
            <Typography variant="h6">Kết quả:</Typography>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(result, null, 2)}</pre>
            {result.image_path && (
              <img src={result.image_path} alt="Kết quả" style={{ maxWidth: '100%', marginTop: 8 }} />
            )}
            {result.crop_image_path && (
              <img src={result.crop_image_path} alt="Crop" style={{ maxWidth: '100%', marginTop: 8 }} />
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default UploadImage; 