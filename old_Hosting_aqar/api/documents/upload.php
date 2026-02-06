<?php
/**
 * Upload Document Endpoint
 * POST /api/documents/upload
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/config.php';

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
    // Check if file was uploaded
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('No file uploaded or upload error');
    }

    // Get form data
    $criteria = $_POST['criteria'] ?? null;
    $subCriteria = $_POST['subCriteria'] ?? null;
    $academicYear = $_POST['academicYear'] ?? null;
    $facultyId = $_POST['facultyId'] ?? null;
    $facultyName = $_POST['facultyName'] ?? null;
    $remarks = $_POST['remarks'] ?? '';
    $documentId = $_POST['documentId'] ?? null;

    // Validate required fields
    if (!$criteria || !$subCriteria || !$academicYear || !$facultyId || !$facultyName) {
        throw new Exception('Missing required fields');
    }

    $file = $_FILES['file'];
    $fileName = $file['name'];
    $fileTmpPath = $file['tmp_name'];
    $fileSize = $file['size'];
    $mimeType = $file['type'];

    // Validate file size (max 50MB)
    if ($fileSize > 50 * 1024 * 1024) {
        throw new Exception('File size exceeds 50MB limit');
    }

    // Create upload directory structure
    // Go up 2 levels to reach Hosting_aqar root: documents/ -> api/ -> Hosting_aqar/
    $uploadDir = __DIR__ . '/../../IQAC/' . $academicYear . '/' . $criteria . '/' . $subCriteria;
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    // Sanitize filename - remove special characters but keep original name
    $fileExtension = pathinfo($fileName, PATHINFO_EXTENSION);
    $baseName = pathinfo($fileName, PATHINFO_FILENAME);
    $sanitizedName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $baseName);
    $uniqueFileName = $sanitizedName . '_' . time() . '.' . $fileExtension;
    $filePath = $uploadDir . '/' . $uniqueFileName;

    // Move uploaded file
    if (!move_uploaded_file($fileTmpPath, $filePath)) {
        throw new Exception('Failed to move uploaded file');
    }

    // Generate file URL
    $fileUrl = APP_URL . '/IQAC/' . $academicYear . '/' . $criteria . '/' . $subCriteria . '/' . $uniqueFileName;

    // Check if this is a reupload
    $isReupload = !empty($documentId);

    $database = new Database();
    $db = $database->getConnection();

    if ($isReupload) {
        // Get old file path and delete it
        $query = "SELECT file_path FROM documents WHERE id = :doc_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':doc_id', $documentId);
        $stmt->execute();
        $oldDoc = $stmt->fetch();

        if ($oldDoc && !empty($oldDoc['file_path']) && file_exists($oldDoc['file_path'])) {
            unlink($oldDoc['file_path']);
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
        $stmt->bindParam(':url', $fileUrl);
        $stmt->bindParam(':file_path', $filePath);
        $stmt->bindParam(':file_name', $fileName);
        $stmt->bindParam(':file_size', $fileSize);
        $stmt->bindParam(':mime_type', $mimeType);
        $stmt->bindParam(':remarks', $remarks);
        $stmt->bindParam(':doc_id', $documentId);
        $stmt->execute();
    } else {
        // Insert new document
        $query = "INSERT INTO documents 
                 (criteria, sub_criteria, faculty_name, faculty_id, academic_year, 
                  document_url, file_path, file_name, file_size, mime_type, remarks)
                 VALUES 
                 (:criteria, :sub_criteria, :faculty_name, :faculty_id, :academic_year,
                  :url, :file_path, :file_name, :file_size, :mime_type, :remarks)";

        $stmt = $db->prepare($query);
        $stmt->bindParam(':criteria', $criteria);
        $stmt->bindParam(':sub_criteria', $subCriteria);
        $stmt->bindParam(':faculty_name', $facultyName);
        $stmt->bindParam(':faculty_id', $facultyId);
        $stmt->bindParam(':academic_year', $academicYear);
        $stmt->bindParam(':url', $fileUrl);
        $stmt->bindParam(':file_path', $filePath);
        $stmt->bindParam(':file_name', $fileName);
        $stmt->bindParam(':file_size', $fileSize);
        $stmt->bindParam(':mime_type', $mimeType);
        $stmt->bindParam(':remarks', $remarks);
        $stmt->execute();

        $documentId = $db->lastInsertId();
    }

    // Fetch the document and transform to camelCase
    $query = "SELECT * FROM documents WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $documentId);
    $stmt->execute();
    $doc = $stmt->fetch();

    // Transform to camelCase
    $document = [
        'id' => (string) $doc['id'],
        'date' => $doc['date'],
        'criteria' => $doc['criteria'],
        'subCriteria' => $doc['sub_criteria'],
        'facultyName' => $doc['faculty_name'],
        'facultyId' => $doc['faculty_id'],
        'academicYear' => $doc['academic_year'],
        'documentUrl' => $doc['document_url'],
        'fileName' => $doc['file_name'],
        'uploadStatus' => $doc['upload_status'],
        'iqacStatus' => $doc['iqac_status'],
        'remarks' => $doc['remarks'],
        'approvedBy' => $doc['approved_by'],
        'approvedDate' => $doc['approved_date']
    ];

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
