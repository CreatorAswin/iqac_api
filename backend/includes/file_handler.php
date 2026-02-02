<?php
/**
 * File Handler Class
 * Handles file upload, deletion, and management for local storage
 */

require_once __DIR__ . '/../config/config.php';

class FileHandler
{

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
     * @throws Exception If upload fails
     */
    public function uploadFile($fileData, $fileName, $mimeType, $academicYear, $criteria, $subCriteria)
    {
        try {
            // Validate file extension
            $extension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
            if (!in_array($extension, ALLOWED_EXTENSIONS)) {
                throw new Exception("File type not allowed. Allowed types: " . implode(', ', ALLOWED_EXTENSIONS));
            }

            // Validate MIME type
            if (!in_array($mimeType, ALLOWED_MIME_TYPES)) {
                throw new Exception("MIME type not allowed");
            }

            // Decode base64 data
            $fileContent = base64_decode($fileData);
            if ($fileContent === false) {
                throw new Exception("Invalid file data encoding");
            }

            $fileSize = strlen($fileContent);

            // Validate file size
            if ($fileSize > MAX_FILE_SIZE) {
                $maxSizeMB = MAX_FILE_SIZE / 1024 / 1024;
                throw new Exception("File size exceeds maximum limit of {$maxSizeMB} MB");
            }

            if ($fileSize === 0) {
                throw new Exception("File is empty");
            }

            // Sanitize folder names
            $academicYear = $this->sanitizeFolderName($academicYear);
            $criteria = $this->sanitizeFolderName($criteria);
            $subCriteria = $this->sanitizeFolderName($subCriteria);

            // Create folder hierarchy: IQAC/Year/Criteria_X/Sub_Criteria_X.X.X/
            $folderPath = UPLOAD_DIR . "{$academicYear}/Criteria_{$criteria}/Sub_Criteria_{$subCriteria}/";
            if (!is_dir($folderPath)) {
                if (!mkdir($folderPath, 0755, true)) {
                    throw new Exception("Failed to create upload directory");
                }
            }

            // Generate unique file name to prevent overwrites
            $uniqueFileName = time() . '_' . uniqid() . '_' . $this->sanitizeFileName($fileName);
            $filePath = $folderPath . $uniqueFileName;

            // Save file
            if (file_put_contents($filePath, $fileContent) === false) {
                throw new Exception("Failed to save file");
            }

            // Set file permissions
            chmod($filePath, 0644);

            // Generate relative path for URL
            $relativePath = str_replace(UPLOAD_DIR, '', $filePath);
            $fileUrl = APP_URL . '/backend/IQAC/' . str_replace('\\', '/', $relativePath);

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
    public function deleteFile($filePath)
    {
        try {
            if (empty($filePath)) {
                return true;
            }

            // Security check: ensure file is within UPLOAD_DIR
            $realPath = realpath($filePath);
            $uploadDir = realpath(UPLOAD_DIR);

            if ($realPath === false || strpos($realPath, $uploadDir) !== 0) {
                error_log("Security: Attempted to delete file outside upload directory: {$filePath}");
                return false;
            }

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
    public function formatFileSize($bytes)
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;
        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }
        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * Sanitize file name
     * 
     * @param string $fileName Original file name
     * @return string Sanitized file name
     */
    private function sanitizeFileName($fileName)
    {
        // Remove any path information
        $fileName = basename($fileName);

        // Replace spaces with underscores
        $fileName = str_replace(' ', '_', $fileName);

        // Remove any characters that aren't alphanumeric, underscore, hyphen, or dot
        $fileName = preg_replace('/[^a-zA-Z0-9_\-\.]/', '', $fileName);

        return $fileName;
    }

    /**
     * Sanitize folder name
     * 
     * @param string $folderName Original folder name
     * @return string Sanitized folder name
     */
    private function sanitizeFolderName($folderName)
    {
        // Remove any path separators
        $folderName = str_replace(['/', '\\', '..'], '', $folderName);

        // Remove any characters that aren't alphanumeric, underscore, hyphen, or dot
        $folderName = preg_replace('/[^a-zA-Z0-9_\-\.]/', '', $folderName);

        return $folderName;
    }

    /**
     * Check if file exists
     * 
     * @param string $filePath File path
     * @return bool True if file exists
     */
    public function fileExists($filePath)
    {
        return file_exists($filePath) && is_file($filePath);
    }

    /**
     * Get disk space information
     * 
     * @return array Disk space info
     */
    public function getDiskSpace()
    {
        $total = disk_total_space(UPLOAD_DIR);
        $free = disk_free_space(UPLOAD_DIR);
        $used = $total - $free;

        return [
            'total' => $this->formatFileSize($total),
            'used' => $this->formatFileSize($used),
            'free' => $this->formatFileSize($free),
            'percent_used' => round(($used / $total) * 100, 2)
        ];
    }
}
