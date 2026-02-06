<?php
/**
 * Get Documents Endpoint
 * GET /api/documents
 * Query params: facultyId, criteria, year, status, debug
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/auth.php';
require_once __DIR__ . '/../../config/database.php';

// Debug mode - can be enabled with ?debug=true (only for troubleshooting)
$debugMode = isset($_GET['debug']) && $_GET['debug'] === 'true';
$debugInfo = [];

try {
    // Verify authentication
    $headers = getallheaders();
    $token = $headers['Authorization'] ?? '';
    $token = str_replace('Bearer ', '', $token);

    if ($debugMode) {
        $debugInfo['auth_check'] = [
            'headers_present' => !empty($headers),
            'authorization_header' => isset($headers['Authorization']),
            'token_length' => strlen($token)
        ];
    }

    $auth = new Auth();
    $user = $auth->verifyToken($token);

    if (!$user) {
        error_log("Authentication failed - Invalid or missing token");
        http_response_code(401);
        $response = ['success' => false, 'error' => 'Unauthorized'];
        if ($debugMode) {
            $response['debug'] = [
                'message' => 'Token verification failed',
                'token_provided' => !empty($token)
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

    // Database connection
    $database = new Database();
    $db = $database->getConnection();

    if ($debugMode) {
        $debugInfo['database'] = 'Connected successfully';
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
        $debugInfo['query'] = [
            'sql' => $query,
            'params' => $params,
            'filters_applied' => [
                'facultyId' => $_GET['facultyId'] ?? 'none',
                'criteria' => $_GET['criteria'] ?? 'none',
                'year' => $_GET['year'] ?? 'none',
                'status' => $_GET['status'] ?? 'none'
            ]
        ];
    }

    // Execute query
    $stmt = $db->prepare($query);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->execute();

    $documents = $stmt->fetchAll();

    if ($debugMode) {
        $debugInfo['query_result'] = [
            'total_documents' => count($documents),
            'first_document_sample' => count($documents) > 0 ? [
                'id' => $documents[0]['id'],
                'criteria' => $documents[0]['criteria'],
                'faculty_name' => $documents[0]['faculty_name'],
                'iqac_status' => $documents[0]['iqac_status']
            ] : null
        ];
    }

    // Log successful query
    error_log("Get documents: Retrieved " . count($documents) . " documents for user " . $user['email']);

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

} catch (PDOException $e) {
    // Database-specific error
    error_log("Database error in get documents: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());

    http_response_code(500);
    $response = [
        'success' => false,
        'error' => 'Database error occurred'
    ];

    if ($debugMode) {
        $response['debug'] = [
            'error_type' => 'PDOException',
            'error_message' => $e->getMessage(),
            'error_code' => $e->getCode()
        ];
    }

    echo json_encode($response);

} catch (Exception $e) {
    // General error
    error_log("Get documents error: " . $e->getMessage());
    error_log("Error file: " . $e->getFile() . " on line " . $e->getLine());
    error_log("Stack trace: " . $e->getTraceAsString());

    http_response_code(500);
    $response = [
        'success' => false,
        'error' => 'Failed to retrieve documents'
    ];

    if ($debugMode) {
        $response['debug'] = [
            'error_type' => get_class($e),
            'error_message' => $e->getMessage(),
            'error_file' => $e->getFile(),
            'error_line' => $e->getLine()
        ];
    }

    echo json_encode($response);
}
