# AQAR Hub - Local File Storage Implementation

## Overview

This guide provides a **simplified approach** using **local file storage** instead of Google Drive. All files will be stored in a folder named **"IQAC"** on your server.

---

## Simplified Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend**: PHP REST API
- **Database**: MySQL
- **File Storage**: Local folder (`IQAC/`)

---

## PHP Backend Structure (Simplified)

```
backend/
├── config/
│   ├── database.php          # Database connection
│   └── config.php            # General configuration
├── includes/
│   ├── auth.php              # Authentication functions
│   ├── file_handler.php      # File upload/delete functions
│   └── cors.php              # CORS handling
├── api/
│   ├── auth/
│   │   ├── login.php
│   │   └── logout.php
│   ├── documents/
│   │   ├── get.php
│   │   ├── upload.php
│   │   ├── update_status.php
│   │   └── delete.php
│   ├── users/
│   │   ├── get.php
│   │   ├── create.php
│   │   ├── update.php
│   │   └── delete.php
│   └── stats/
│       └── get.php
├── IQAC/                     # File storage folder
│   ├── 2024-25/
│   │   ├── Criteria_1/
│   │   │   └── Sub_Criteria_1.1.1/
│   │   └── Criteria_2/
│   └── 2023-24/
├── .env                      # Environment variables
├── .htaccess                 # Apache configuration
└── index.php                 # API router
```

---

## Core PHP Files

### 1. config/config.php

```php
<?php
// Application configuration
define('APP_ENV', $_ENV['APP_ENV'] ?? 'development');
define('APP_URL', $_ENV['APP_URL'] ?? 'http://localhost:8000');

// File storage configuration
define('UPLOAD_DIR', __DIR__ . '/../IQAC/');
define('MAX_FILE_SIZE', 50 * 1024 * 1024); // 50 MB
define('ALLOWED_EXTENSIONS', ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif']);

// Ensure upload directory exists
if (!is_dir(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0755, true);
}
?>
```

### 2. includes/file_handler.php

```php
<?php
require_once __DIR__ . '/../config/config.php';

class FileHandler {
    
    /**
     * Upload file to local storage
     * 
     * @param string $fileData Base64 encoded file data
     * @param string $fileName Original file name
     * @param string $mimeType File MIME type
     * @param string $academicYear Academic year (e.g., 2024-25)
     * @param string $criteria Criteria number
     * @param string $subCriteria Sub-criteria ID
     * @return array File information (path, url, size)
     */
    public function uploadFile($fileData, $fileName, $mimeType, $academicYear, $criteria, $subCriteria) {
        try {
            // Validate file extension
            $extension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
            if (!in_array($extension, ALLOWED_EXTENSIONS)) {
                throw new Exception("File type not allowed. Allowed types: " . implode(', ', ALLOWED_EXTENSIONS));
            }
            
            // Decode base64 data
            $fileContent = base64_decode($fileData);
            $fileSize = strlen($fileContent);
            
            // Validate file size
            if ($fileSize > MAX_FILE_SIZE) {
                throw new Exception("File size exceeds maximum limit of " . (MAX_FILE_SIZE / 1024 / 1024) . " MB");
            }
            
            // Create folder hierarchy: IQAC/Year/Criteria_X/Sub_Criteria_X.X.X/
            $folderPath = UPLOAD_DIR . "{$academicYear}/Criteria_{$criteria}/Sub_Criteria_{$subCriteria}/";
            if (!is_dir($folderPath)) {
                mkdir($folderPath, 0755, true);
            }
            
            // Generate unique file name to prevent overwrites
            $uniqueFileName = time() . '_' . uniqid() . '_' . $fileName;
            $filePath = $folderPath . $uniqueFileName;
            
            // Save file
            if (file_put_contents($filePath, $fileContent) === false) {
                throw new Exception("Failed to save file");
            }
            
            // Generate relative path for URL
            $relativePath = str_replace(UPLOAD_DIR, '', $filePath);
            $fileUrl = APP_URL . '/IQAC/' . str_replace('\\', '/', $relativePath);
            
            return [
                'filePath' => $filePath,
                'fileUrl' => $fileUrl,
                'fileName' => $uniqueFileName,
                'originalName' => $fileName,
                'fileSize' => $fileSize,
                'mimeType' => $mimeType
            ];
            
        } catch (Exception $e) {
            error_log("File upload error: " . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Delete file from local storage
     * 
     * @param string $filePath Full path to file
     * @return bool Success status
     */
    public function deleteFile($filePath) {
        try {
            if (file_exists($filePath)) {
                return unlink($filePath);
            }
            return true; // File doesn't exist, consider it deleted
        } catch (Exception $e) {
            error_log("File delete error: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get file size in human-readable format
     * 
     * @param int $bytes File size in bytes
     * @return string Formatted file size
     */
    public function formatFileSize($bytes) {
        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;
        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }
        return round($bytes, 2) . ' ' . $units[$i];
    }
}
?>
```

### 3. api/documents/upload.php (Simplified)

```php
<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/file_handler.php';
require_once __DIR__ . '/../../config/database.php';

// Verify authentication
$headers = getallheaders();
$token = $headers['Authorization'] ?? '';
$token = str_replace('Bearer ', '', $token);

$auth = new Auth();
$user = $auth->verifyToken($token);

if (!$user) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

try {
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    $required = ['fileName', 'fileData', 'mimeType', 'criteria', 'subCriteria', 'academicYear', 'facultyId', 'facultyName'];
    foreach ($required as $field) {
        if (!isset($input[$field])) {
            throw new Exception("Missing required field: {$field}");
        }
    }
    
    // Upload file to local storage
    $fileHandler = new FileHandler();
    $fileInfo = $fileHandler->uploadFile(
        $input['fileData'],
        $input['fileName'],
        $input['mimeType'],
        $input['academicYear'],
        $input['criteria'],
        $input['subCriteria']
    );
    
    // Check if this is a reupload
    $isReupload = isset($input['documentId']) && !empty($input['documentId']);
    
    $database = new Database();
    $db = $database->getConnection();
    
    if ($isReupload) {
        // Get old file path and delete it
        $query = "SELECT file_path FROM documents WHERE id = :doc_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':doc_id', $input['documentId']);
        $stmt->execute();
        $oldDoc = $stmt->fetch();
        
        if ($oldDoc && !empty($oldDoc['file_path'])) {
            $fileHandler->deleteFile($oldDoc['file_path']);
        }
        
        // Update existing document
        $query = "UPDATE documents SET 
                 date = NOW(),
                 document_url = :url,
                 file_path = :file_path,
                 file_name = :file_name,
                 file_size = :file_size,
                 mime_type = :mime_type,
                 iqac_status = 'Pending',
                 remarks = :remarks,
                 approved_by = NULL,
                 approved_date = NULL
                 WHERE id = :doc_id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':url', $fileInfo['fileUrl']);
        $stmt->bindParam(':file_path', $fileInfo['filePath']);
        $stmt->bindParam(':file_name', $fileInfo['originalName']);
        $stmt->bindParam(':file_size', $fileInfo['fileSize']);
        $stmt->bindParam(':mime_type', $fileInfo['mimeType']);
        $stmt->bindParam(':remarks', $input['remarks']);
        $stmt->bindParam(':doc_id', $input['documentId']);
        $stmt->execute();
        
        $documentId = $input['documentId'];
    } else {
        // Insert new document
        $query = "INSERT INTO documents 
                 (criteria, sub_criteria, faculty_name, faculty_id, academic_year, 
                  document_url, file_path, file_name, file_size, mime_type, remarks)
                 VALUES 
                 (:criteria, :sub_criteria, :faculty_name, :faculty_id, :academic_year,
                  :url, :file_path, :file_name, :file_size, :mime_type, :remarks)";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':criteria', $input['criteria']);
        $stmt->bindParam(':sub_criteria', $input['subCriteria']);
        $stmt->bindParam(':faculty_name', $input['facultyName']);
        $stmt->bindParam(':faculty_id', $input['facultyId']);
        $stmt->bindParam(':academic_year', $input['academicYear']);
        $stmt->bindParam(':url', $fileInfo['fileUrl']);
        $stmt->bindParam(':file_path', $fileInfo['filePath']);
        $stmt->bindParam(':file_name', $fileInfo['originalName']);
        $stmt->bindParam(':file_size', $fileInfo['fileSize']);
        $stmt->bindParam(':mime_type', $fileInfo['mimeType']);
        $stmt->bindParam(':remarks', $input['remarks']);
        $stmt->execute();
        
        $documentId = $db->lastInsertId();
    }
    
    // Fetch the document
    $query = "SELECT * FROM documents WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $documentId);
    $stmt->execute();
    $document = $stmt->fetch();
    
    echo json_encode([
        'success' => true,
        'data' => $document,
        'message' => $isReupload ? 'Document re-uploaded successfully' : 'Document uploaded successfully'
    ]);
    
} catch (Exception $e) {
    error_log("Upload error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
```

### 4. api/documents/delete.php (Updated)

```php
<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../includes/file_handler.php';
require_once __DIR__ . '/../../config/database.php';

// Verify authentication
$headers = getallheaders();
$token = $headers['Authorization'] ?? '';
$token = str_replace('Bearer ', '', $token);

$auth = new Auth();
$user = $auth->verifyToken($token);

if (!$user) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['documentId'])) {
        throw new Exception("Missing documentId");
    }
    
    $database = new Database();
    $db = $database->getConnection();
    
    // Get file path before deleting record
    $query = "SELECT file_path FROM documents WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $input['documentId']);
    $stmt->execute();
    $document = $stmt->fetch();
    
    if (!$document) {
        throw new Exception("Document not found");
    }
    
    // Delete file from storage
    if (!empty($document['file_path'])) {
        $fileHandler = new FileHandler();
        $fileHandler->deleteFile($document['file_path']);
    }
    
    // Delete database record
    $query = "DELETE FROM documents WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $input['documentId']);
    $stmt->execute();
    
    echo json_encode([
        'success' => true,
        'message' => 'Document deleted successfully'
    ]);
    
} catch (Exception $e) {
    error_log("Delete error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
```

---

## Updated Database Schema

Add `file_path` column to documents table:

```sql
ALTER TABLE documents 
ADD COLUMN file_path TEXT COMMENT 'Local file path' AFTER document_url;

-- Update existing column comment
ALTER TABLE documents 
MODIFY COLUMN document_url TEXT NOT NULL COMMENT 'Public URL to access file';
```

Or use this updated CREATE TABLE:

```sql
CREATE TABLE IF NOT EXISTS documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    criteria VARCHAR(10) NOT NULL,
    sub_criteria VARCHAR(20) NOT NULL,
    faculty_name VARCHAR(255) NOT NULL,
    faculty_id VARCHAR(50) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    document_url TEXT NOT NULL COMMENT 'Public URL to access file',
    file_path TEXT COMMENT 'Local file system path',
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT COMMENT 'File size in bytes',
    mime_type VARCHAR(100),
    upload_status ENUM('Uploaded', 'Failed') DEFAULT 'Uploaded',
    iqac_status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    remarks TEXT,
    approved_by VARCHAR(255),
    approved_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_faculty_id (faculty_id),
    INDEX idx_criteria (criteria),
    INDEX idx_academic_year (academic_year),
    INDEX idx_iqac_status (iqac_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## .htaccess Configuration

Allow access to uploaded files:

```apache
# Enable rewrite engine
RewriteEngine On

# Allow direct access to IQAC folder
RewriteCond %{REQUEST_URI} ^/IQAC/
RewriteRule ^ - [L]

# Route all other requests to index.php
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]

# Security: Prevent directory listing
Options -Indexes

# Security: Protect sensitive files
<FilesMatch "^\.">
    Order allow,deny
    Deny from all
</FilesMatch>
```

---

## Environment Configuration (.env)

```env
# Application
APP_ENV=development
APP_URL=http://localhost:8000

# Database
DB_HOST=localhost
DB_NAME=aqar_hub
DB_USER=root
DB_PASSWORD=your_password

# Security
JWT_SECRET=your_secret_key_here
SESSION_LIFETIME=86400

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## Setup Instructions

### 1. Create Backend Directory

```bash
mkdir aqar-hub-backend
cd aqar-hub-backend
```

### 2. Create Folder Structure

```bash
mkdir -p config includes api/{auth,documents,users,stats} IQAC
```

### 3. Set Permissions

```bash
# Make IQAC folder writable
chmod 755 IQAC
chown www-data:www-data IQAC  # For Apache
# or
chown nginx:nginx IQAC  # For Nginx
```

### 4. Copy PHP Files

Copy all the PHP files from this document into their respective locations.

### 5. Configure .env

Create `.env` file with your database credentials.

### 6. Test File Upload

```bash
# Start PHP server
php -S localhost:8000

# Test upload (after login)
curl -X POST http://localhost:8000/api/documents/upload \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d @test_upload.json
```

---

## Advantages of Local Storage

✅ **Simpler Setup** - No Google API configuration needed
✅ **Faster** - Direct file system access
✅ **No External Dependencies** - Everything on your server
✅ **Full Control** - Complete control over files
✅ **No API Limits** - No quota restrictions
✅ **Easier Backup** - Standard file system backup
✅ **Lower Cost** - No cloud storage fees

---

## File Access

Files are accessible via direct URL:
```
http://your-domain.com/IQAC/2024-25/Criteria_1/Sub_Criteria_1.1.1/filename.pdf
```

---

## Backup Strategy

### Daily Backup Script

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d)
BACKUP_DIR="/backup"

# Backup database
mysqldump -u root -p aqar_hub > $BACKUP_DIR/db_$DATE.sql

# Backup files
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /path/to/backend/IQAC/

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

Add to crontab:
```bash
0 2 * * * /path/to/backup.sh
```

---

## Security Considerations

1. **File Type Validation** - Only allow specific file types
2. **File Size Limits** - Prevent large file uploads
3. **Unique File Names** - Prevent file overwrites
4. **Directory Permissions** - Proper folder permissions (755)
5. **Access Control** - Verify user permissions before file access
6. **Virus Scanning** - Consider adding ClamAV integration

---

## Next Steps

1. Create the backend folder structure
2. Copy all PHP files
3. Set up database with updated schema
4. Configure `.htaccess`
5. Set folder permissions
6. Test file upload
7. Update frontend to use new API

This is much simpler than the Google Drive approach! 🎉
