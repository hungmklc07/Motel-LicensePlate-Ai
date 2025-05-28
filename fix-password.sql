-- Update admin password to 'admin123'
UPDATE users 
SET password = '$2b$10$dysYQdmHMub/qAK/9YGVXu3McoR7hBfGbIKjvVBlbazzSEYoLEdjm'
WHERE username = 'admin'; 