-- Thêm người dùng vào hệ thống
-- Password hashed là "admin123" (bcrypt hash)
INSERT INTO users (username, password, full_name, role)
VALUES
('admin', '$2a$10$hlG3.FBLXNUU0UkjP6jDN.MMztY1ZIyGCaj5s4nlMcl9bOX3vaBiy', 'Administrator', 'admin')
ON CONFLICT (username) DO UPDATE SET password = '$2a$10$hlG3.FBLXNUU0UkjP6jDN.MMztY1ZIyGCaj5s4nlMcl9bOX3vaBiy'; 