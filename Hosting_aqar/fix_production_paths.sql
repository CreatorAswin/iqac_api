-- SQL Script to Fix Production Database Paths
-- Run this on your Hostinger database: u336570575_aqar
-- This will update all document URLs and file paths to match production

-- IMPORTANT: Run this AFTER uploading files to the server

-- Update document_url to use production domain
UPDATE documents 
SET document_url = CONCAT(
    'https://aqar.winiksolutions.com/IQAC/',
    academic_year, '/',
    criteria, '/',
    sub_criteria, '/',
    SUBSTRING_INDEX(document_url, '/', -1)  -- Extract just the filename
)
WHERE document_url IS NOT NULL;

-- Update file_path to use Linux server path
-- Replace with your actual Hostinger path
UPDATE documents 
SET file_path = CONCAT(
    '/home/u336570575/domains/winiksolutions.com/public_html/aqar/IQAC/',
    academic_year, '/',
    criteria, '/',
    sub_criteria, '/',
    SUBSTRING_INDEX(REPLACE(file_path, '\\', '/'), '/', -1)  -- Extract just the filename
)
WHERE file_path IS NOT NULL;

-- Verify the updates
SELECT 
    id,
    academic_year,
    criteria,
    sub_criteria,
    file_name,
    document_url,
    file_path
FROM documents
ORDER BY id;

-- Check counts
SELECT 
    COUNT(*) as total_documents,
    SUM(CASE WHEN document_url LIKE 'https://aqar.winiksolutions.com/IQAC/%' THEN 1 ELSE 0 END) as correct_urls,
    SUM(CASE WHEN file_path LIKE '/home/u336570575/%' THEN 1 ELSE 0 END) as correct_paths
FROM documents;
