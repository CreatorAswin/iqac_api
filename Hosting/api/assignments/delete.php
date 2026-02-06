<?php
/**
 * Delete Assignment Endpoint
 * DELETE /api/assignments
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

// Check if user is admin
if ($user['role'] !== 'Admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Admin access required']);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['assignmentId'])) {
        throw new Exception("assignmentId is required");
    }

    $database = new Database();
    $db = $database->getConnection();

    // Delete assignment
    $query = "DELETE FROM assignments WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $input['assignmentId']);
    $stmt->execute();

    if ($stmt->rowCount() === 0) {
        throw new Exception("Assignment not found");
    }

    echo json_encode([
        'success' => true,
        'message' => 'Assignment deleted successfully'
    ]);

} catch (Exception $e) {
    error_log("Delete assignment error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
