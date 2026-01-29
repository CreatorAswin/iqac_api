-- AQAR Hub Database Schema
-- MySQL 5.7+ / MariaDB 10.2+
-- Character Set: UTF8MB4 for full Unicode support

-- Create database
CREATE DATABASE IF NOT EXISTS aqar_hub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE aqar_hub;

-- ============================================
-- 1. USERS TABLE (replaces credentials sheet)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL COMMENT 'Bcrypt hashed password',
    role ENUM('Admin', 'Management', 'IQAC', 'Faculty') NOT NULL,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='User credentials and roles';

-- Insert default admin user (password: admin123)
INSERT INTO users (name, email, password, role, status) VALUES
('Admin', 'admin@iqac.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'Active');

-- ============================================
-- 2. DOCUMENTS TABLE (replaces track_sheet)
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    criteria VARCHAR(10) NOT NULL COMMENT 'Criteria number (1-7)',
    sub_criteria VARCHAR(20) NOT NULL COMMENT 'Sub-criteria (e.g., 1.1.1)',
    faculty_name VARCHAR(255) NOT NULL,
    faculty_id VARCHAR(50) NOT NULL COMMENT 'Faculty email or ID',
    academic_year VARCHAR(20) NOT NULL COMMENT 'e.g., 2024-25',
    document_url TEXT NOT NULL COMMENT 'Public URL to access file',
    file_path TEXT COMMENT 'Local file system path',
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT COMMENT 'File size in bytes',
    mime_type VARCHAR(100) COMMENT 'File MIME type',
    upload_status ENUM('Uploaded', 'Failed') DEFAULT 'Uploaded',
    iqac_status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    remarks TEXT COMMENT 'Comments or notes',
    approved_by VARCHAR(255) COMMENT 'Name of approver',
    approved_date TIMESTAMP NULL COMMENT 'Date of approval/rejection',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_faculty_id (faculty_id),
    INDEX idx_criteria (criteria),
    INDEX idx_sub_criteria (sub_criteria),
    INDEX idx_academic_year (academic_year),
    INDEX idx_iqac_status (iqac_status),
    INDEX idx_date (date),
    INDEX idx_composite (faculty_id, academic_year, iqac_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Document tracking and metadata';

-- ============================================
-- 3. ASSIGNMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    faculty_id VARCHAR(50) NOT NULL COMMENT 'Faculty email or ID',
    faculty_name VARCHAR(255) NOT NULL,
    criteria_id VARCHAR(10) NOT NULL COMMENT 'Criteria number',
    sub_criteria_id VARCHAR(20) NOT NULL COMMENT 'Sub-criteria ID',
    assigned_by VARCHAR(255) NOT NULL COMMENT 'Admin who assigned',
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_faculty_id (faculty_id),
    INDEX idx_criteria (criteria_id),
    INDEX idx_sub_criteria (sub_criteria_id),
    UNIQUE KEY unique_assignment (faculty_id, sub_criteria_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Faculty criteria assignments';

-- ============================================
-- 4. SESSIONS TABLE (for authentication)
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(45) COMMENT 'IPv4 or IPv6 address',
    user_agent TEXT COMMENT 'Browser user agent',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_session_token (session_token),
    INDEX idx_expires_at (expires_at),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='User session management';

-- ============================================
-- 5. ACTIVITY LOGS TABLE (audit trail)
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) COMMENT 'User email or ID',
    action VARCHAR(100) NOT NULL COMMENT 'Action performed',
    entity_type VARCHAR(50) COMMENT 'Type of entity (document, user, etc.)',
    entity_id INT COMMENT 'ID of affected entity',
    details TEXT COMMENT 'JSON or text details',
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='System activity and audit logs';

-- ============================================
-- VIEWS FOR REPORTING
-- ============================================

-- View: Document statistics by criteria
CREATE OR REPLACE VIEW v_documents_by_criteria AS
SELECT 
    criteria,
    COUNT(*) as total_documents,
    SUM(CASE WHEN iqac_status = 'Approved' THEN 1 ELSE 0 END) as approved,
    SUM(CASE WHEN iqac_status = 'Pending' THEN 1 ELSE 0 END) as pending,
    SUM(CASE WHEN iqac_status = 'Rejected' THEN 1 ELSE 0 END) as rejected
FROM documents
GROUP BY criteria
ORDER BY criteria;

-- View: Document statistics by academic year
CREATE OR REPLACE VIEW v_documents_by_year AS
SELECT 
    academic_year,
    COUNT(*) as total_documents,
    SUM(CASE WHEN iqac_status = 'Approved' THEN 1 ELSE 0 END) as approved,
    SUM(CASE WHEN iqac_status = 'Pending' THEN 1 ELSE 0 END) as pending,
    SUM(CASE WHEN iqac_status = 'Rejected' THEN 1 ELSE 0 END) as rejected
FROM documents
GROUP BY academic_year
ORDER BY academic_year DESC;

-- View: Faculty document summary
CREATE OR REPLACE VIEW v_faculty_summary AS
SELECT 
    faculty_id,
    faculty_name,
    COUNT(*) as total_uploads,
    SUM(CASE WHEN iqac_status = 'Approved' THEN 1 ELSE 0 END) as approved,
    SUM(CASE WHEN iqac_status = 'Pending' THEN 1 ELSE 0 END) as pending,
    SUM(CASE WHEN iqac_status = 'Rejected' THEN 1 ELSE 0 END) as rejected,
    MAX(date) as last_upload_date
FROM documents
GROUP BY faculty_id, faculty_name
ORDER BY total_uploads DESC;

-- ============================================
-- STORED PROCEDURES
-- ============================================

-- Procedure: Clean expired sessions
DELIMITER //
CREATE PROCEDURE sp_clean_expired_sessions()
BEGIN
    DELETE FROM sessions WHERE expires_at < NOW();
END //
DELIMITER ;

-- Procedure: Get document statistics
DELIMITER //
CREATE PROCEDURE sp_get_document_stats()
BEGIN
    SELECT 
        COUNT(*) as total_documents,
        SUM(CASE WHEN iqac_status = 'Approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN iqac_status = 'Pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN iqac_status = 'Rejected' THEN 1 ELSE 0 END) as rejected
    FROM documents;
    
    SELECT * FROM v_documents_by_criteria;
    SELECT * FROM v_documents_by_year;
END //
DELIMITER ;

-- ============================================
-- EVENTS (for automatic cleanup)
-- ============================================

-- Enable event scheduler
SET GLOBAL event_scheduler = ON;

-- Event: Clean expired sessions daily
CREATE EVENT IF NOT EXISTS evt_clean_sessions
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
    CALL sp_clean_expired_sessions();

-- ============================================
-- SAMPLE DATA (for testing)
-- ============================================

-- Sample users
INSERT INTO users (name, email, password, role, status) VALUES
('Dr. John Smith', 'john.smith@iqac.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Faculty', 'Active'),
('Dr. Jane Doe', 'jane.doe@iqac.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Faculty', 'Active'),
('IQAC Coordinator', 'iqac@iqac.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'IQAC', 'Active'),
('Management User', 'management@iqac.edu', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Management', 'Active');

-- ============================================
-- GRANTS AND PERMISSIONS
-- ============================================

-- Create application user (recommended for production)
-- CREATE USER 'aqar_app'@'localhost' IDENTIFIED BY 'secure_password_here';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON aqar_hub.* TO 'aqar_app'@'localhost';
-- FLUSH PRIVILEGES;

-- ============================================
-- BACKUP RECOMMENDATIONS
-- ============================================

-- Daily backup command (run via cron):
-- mysqldump -u root -p aqar_hub > /backup/aqar_hub_$(date +\%Y\%m\%d).sql

-- Restore command:
-- mysql -u root -p aqar_hub < /backup/aqar_hub_20240126.sql

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check table structure
SHOW TABLES;

-- Check indexes
SHOW INDEX FROM documents;
SHOW INDEX FROM users;

-- Check table sizes
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS "Size (MB)"
FROM information_schema.TABLES
WHERE table_schema = 'aqar_hub'
ORDER BY (data_length + index_length) DESC;

-- Check character set
SELECT 
    table_name,
    table_collation
FROM information_schema.TABLES
WHERE table_schema = 'aqar_hub';
