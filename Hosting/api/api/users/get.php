<?php
/**
 * Get Users Endpoint
 * GET /api/users
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

// Check if user is admin or IQAC
if ($user['role'] !== 'Admin' && $user['role'] !== 'IQAC') {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Admin or IQAC access required']);
    exit;
}

try {
    $database = new Database();
    $db = $database->getConnection();

    $query = "SELECT id, name, email, role, status, created_at FROM users ORDER BY created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();

    $users = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'data' => $users
    ]);

} catch (Exception $e) {
    error_log("Get users error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to retrieve users'
    ]);
}
