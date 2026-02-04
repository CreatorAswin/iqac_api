-- SQL queries to fix existing document_url and file_path in the database
-- Run these queries to update existing records that have the wrong path structure

-- BACKUP YOUR DATABASE FIRST!
-- Run this command before making changes:
-- mysqldump -u root -p aqar_hub > aqar_hub_backup_before_path_fix.sql

-- ============================================
-- For PRODUCTION (Hostinger) Database
-- ============================================

-- 1. Update document_url to match production URL structure
-- This assumes your production URL is: https://aqar.winiksolutions.com
UPDATE documents 
SET document_url = CONCAT(
    'https://aqar.winiksolutions.com/IQAC/',
    academic_year, '/',
    criteria, '/',
    sub_criteria, '/',
    SUBSTRING_INDEX(document_url, '/', -1)  -- Get just the filename
)
WHERE document_url IS NOT NULL;

-- 2. Update file_path to match the new directory structure
-- This will update paths to match the server structure
-- IMPORTANT: Replace the path below with your actual Hostinger server path
-- You can find this by running: echo __DIR__; in a PHP file on your server
UPDATE documents 
SET file_path = CONCAT(
    '/home/your_username/domains/aqar.winiksolutions.com/public_html/IQAC/',
    academic_year, '/',
    criteria, '/',
    sub_criteria, '/',
    SUBSTRING_INDEX(REPLACE(file_path, '\\', '/'), '/', -1)  -- Get just the filename
)
WHERE file_path IS NOT NULL;


-- ============================================
-- For LOCAL (XAMPP) Database
-- ============================================

-- 1. Update document_url for local development
UPDATE documents 
SET document_url = CONCAT(
    'http://localhost/aqar/Hosting_aqar/IQAC/',
    academic_year, '/',
    criteria, '/',
    sub_criteria, '/',
    SUBSTRING_INDEX(document_url, '/', -1)  -- Get just the filename
)
WHERE document_url IS NOT NULL;

-- 2. Update file_path for local development
UPDATE documents 
SET file_path = CONCAT(
    'C:/xampp/htdocs/aqar/Hosting_aqar/IQAC/',
    academic_year, '/',
    criteria, '/',
    sub_criteria, '/',
    SUBSTRING_INDEX(REPLACE(file_path, '\\', '/'), '/', -1)  -- Get just the filename
)
WHERE file_path IS NOT NULL;


-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check the updated records
SELECT 
    id, 
    academic_year, 
    criteria, 
    sub_criteria, 
    file_name,
    document_url, 
    file_path 
FROM documents 
ORDER BY id DESC 
LIMIT 10;

-- Count records by pattern to verify all were updated
SELECT 
    COUNT(*) as total_records,
    SUM(CASE WHEN document_url LIKE '%/IQAC/%' THEN 1 ELSE 0 END) as correct_url_pattern,
    SUM(CASE WHEN file_path LIKE '%/IQAC/%' OR file_path LIKE '%\\IQAC\\%' THEN 1 ELSE 0 END) as correct_path_pattern
FROM documents;
