<?php
/**
 * Get Documents Endpoint
 * GET /api/documents
 * Query params: facultyId, criteria, year, status
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../includes/cors.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../config/database.php';

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
    $database = new Database();
    $db = $database->getConnection();

    // Build query with filters
    $query = "SELECT * FROM documents WHERE 1=1";
    $params = [];

    // Apply filters from query parameters
    if (isset($_GET['facultyId']) && !empty($_GET['facultyId'])) {
        $query .= " AND faculty_id = :faculty_id";
        $params[':faculty_id'] = $_GET['facultyId'];
    }

    if (isset($_GET['criteria']) && !empty($_GET['criteria'])) {
        $query .= " AND criteria = :criteria";
        $params[':criteria'] = $_GET['criteria'];
    }

    if (isset($_GET['year']) && !empty($_GET['year'])) {
        $query .= " AND academic_year = :year";
        $params[':year'] = $_GET['year'];
    }

    if (isset($_GET['status']) && !empty($_GET['status'])) {
        $query .= " AND iqac_status = :status";
        $params[':status'] = $_GET['status'];
    }

    $query .= " ORDER BY date DESC";

    $stmt = $db->prepare($query);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->execute();

    $documents = $stmt->fetchAll();

    // Transform snake_case to camelCase for frontend
    $transformedDocuments = array_map(function ($doc) {
        return [
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
    }, $documents);

    echo json_encode([
        'success' => true,
        'data' => $transformedDocuments
    ]);

} catch (Exception $e) {
    error_log("Get documents error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to retrieve documents'
    ]);
}
