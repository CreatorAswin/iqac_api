<?php
/**
 * Create Assignment Endpoint
 * POST /api/assignments
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

// Check if user is admin
if ($user['role'] !== 'Admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Admin access required']);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'), true);

    // Validate required fields
    $required = ['facultyId', 'facultyName', 'criteriaId', 'subCriteriaId'];
    foreach ($required as $field) {
        if (!isset($input[$field]) || empty($input[$field])) {
            throw new Exception("Missing required field: {$field}");
        }
    }

    $database = new Database();
    $db = $database->getConnection();

    // Check if assignment already exists
    $query = "SELECT id FROM assignments WHERE faculty_id = :faculty_id AND sub_criteria_id = :sub_criteria_id";
    $stmt = $db->prepare($query);
    $stmt->execute([
        ':faculty_id' => $input['facultyId'],
        ':sub_criteria_id' => $input['subCriteriaId']
    ]);

    if ($stmt->rowCount() > 0) {
        throw new Exception("Assignment already exists for this faculty and sub-criteria");
    }

    // Insert assignment
    $query = "INSERT INTO assignments (faculty_id, faculty_name, criteria_id, sub_criteria_id, assigned_by) 
             VALUES (:faculty_id, :faculty_name, :criteria_id, :sub_criteria_id, :assigned_by)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':faculty_id', $input['facultyId']);
    $stmt->bindParam(':faculty_name', $input['facultyName']);
    $stmt->bindParam(':criteria_id', $input['criteriaId']);
    $stmt->bindParam(':sub_criteria_id', $input['subCriteriaId']);
    $assignedBy = $input['assignedBy'] ?? $user['name'];
    $stmt->bindParam(':assigned_by', $assignedBy);
    $stmt->execute();

    $assignmentId = $db->lastInsertId();

    // Fetch created assignment
    $query = "SELECT * FROM assignments WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $assignmentId);
    $stmt->execute();
    $assignment = $stmt->fetch();

    echo json_encode([
        'success' => true,
        'data' => $assignment,
        'message' => 'Assignment created successfully'
    ]);

} catch (Exception $e) {
    error_log("Create assignment error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
