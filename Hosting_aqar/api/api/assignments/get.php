<?php
/**
 * Get Assignments Endpoint
 * GET /api/assignments
 * Query param: facultyId (optional)
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/auth.php';
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
    $database = new Database();
    $db = $database->getConnection();

    $query = "SELECT * FROM assignments WHERE 1=1";
    $params = [];

    // Filter by faculty ID if provided
    if (isset($_GET['facultyId']) && !empty($_GET['facultyId'])) {
        $query .= " AND faculty_id = :faculty_id";
        $params[':faculty_id'] = $_GET['facultyId'];
    }

    $query .= " ORDER BY assigned_date DESC";

    $stmt = $db->prepare($query);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->execute();

    $assignments = $stmt->fetchAll();

    // Transform snake_case to camelCase for frontend
    $transformedAssignments = array_map(function ($assignment) {
        return [
            'id' => (string) $assignment['id'],
            'facultyId' => $assignment['faculty_id'],
            'facultyName' => $assignment['faculty_name'],
            'criteriaId' => $assignment['criteria_id'],
            'subCriteriaId' => $assignment['sub_criteria_id'],
            'assignedBy' => $assignment['assigned_by'],
            'assignedDate' => $assignment['assigned_date']
        ];
    }, $assignments);

    echo json_encode([
        'success' => true,
        'data' => $transformedAssignments
    ]);

} catch (Exception $e) {
    error_log("Get assignments error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to retrieve assignments'
    ]);
}
