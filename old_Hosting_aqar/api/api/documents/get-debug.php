<?php
/**
 * Enhanced Get Documents Endpoint with Debug Mode
 * GET /api/documents
 * Query params: facultyId, criteria, year, status, debug
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../config/database.php';

// Debug mode - set to true temporarily for production debugging
$debugMode = isset($_GET['debug']) && $_GET['debug'] === 'true';

$debugInfo = [];

// Verify authentication
$headers = getallheaders();
$token = $headers['Authorization'] ?? '';
$token = str_replace('Bearer ', '', $token);

if ($debugMode) {
    $debugInfo['headers_received'] = array_keys($headers);
    $debugInfo['token_present'] = !empty($token);
    $debugInfo['token_length'] = strlen($token);
}

$auth = new Auth();
$user = $auth->verifyToken($token);

if (!$user) {
    http_response_code(401);
    $response = ['success' => false, 'error' => 'Unauthorized'];
    if ($debugMode) {
        $response['debug'] = [
            'message' => 'Token verification failed',
            'token_provided' => !empty($token),
            'headers' => $debugInfo
        ];
    }
    echo json_encode($response);
    exit;
}

if ($debugMode) {
    $debugInfo['authenticated_user'] = [
        'id' => $user['id'],
        'email' => $user['email'],
        'role' => $user['role']
    ];
}

try {
    $database = new Database();
    $db = $database->getConnection();

    if ($debugMode) {
        $debugInfo['database_connection'] = 'SUCCESS';
    }

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

    if ($debugMode) {
        $debugInfo['query'] = $query;
        $debugInfo['params'] = $params;
        $debugInfo['filters_applied'] = [
            'facultyId' => $_GET['facultyId'] ?? 'none',
            'criteria' => $_GET['criteria'] ?? 'none',
            'year' => $_GET['year'] ?? 'none',
            'status' => $_GET['status'] ?? 'none'
        ];
    }

    $stmt = $db->prepare($query);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->execute();

    $documents = $stmt->fetchAll();

    if ($debugMode) {
        $debugInfo['total_documents_found'] = count($documents);
        if (count($documents) > 0) {
            $debugInfo['first_document_raw'] = $documents[0];
        }
    }

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
            'remarks' => $doc['remarks'] ?? '',
            'approvedBy' => $doc['approved_by'] ?? null,
            'approvedDate' => $doc['approved_date'] ?? null
        ];
    }, $documents);

    $response = [
        'success' => true,
        'data' => $transformedDocuments
    ];

    if ($debugMode) {
        $response['debug'] = $debugInfo;
        $response['debug']['total_transformed'] = count($transformedDocuments);
    }

    echo json_encode($response);

} catch (Exception $e) {
    error_log("Get documents error: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());

    http_response_code(500);
    $response = [
        'success' => false,
        'error' => 'Failed to retrieve documents'
    ];

    if ($debugMode) {
        $response['debug'] = [
            'error_message' => $e->getMessage(),
            'error_file' => $e->getFile(),
            'error_line' => $e->getLine(),
            'trace' => $e->getTraceAsString()
        ];
    }

    echo json_encode($response);
}
