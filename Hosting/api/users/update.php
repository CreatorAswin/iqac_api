<?php
/**
 * Update User Endpoint
 * PUT /api/users
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

    if (!isset($input['id'])) {
        throw new Exception("User ID is required");
    }

    $database = new Database();
    $db = $database->getConnection();

    // Build update query dynamically
    $updates = [];
    $params = [':id' => $input['id']];

    if (isset($input['name'])) {
        $updates[] = "name = :name";
        $params[':name'] = $input['name'];
    }

    if (isset($input['email'])) {
        // Check if email already exists for another user
        $query = "SELECT id FROM users WHERE email = :email AND id != :id";
        $stmt = $db->prepare($query);
        $stmt->execute([':email' => $input['email'], ':id' => $input['id']]);
        if ($stmt->rowCount() > 0) {
            throw new Exception("Email already exists");
        }
        $updates[] = "email = :email";
        $params[':email'] = $input['email'];
    }

    if (isset($input['password']) && !empty($input['password'])) {
        $updates[] = "password = :password";
        $params[':password'] = password_hash($input['password'], PASSWORD_BCRYPT);
    }

    if (isset($input['role'])) {
        $validRoles = ['Admin', 'Management', 'IQAC', 'Faculty'];
        if (!in_array($input['role'], $validRoles)) {
            throw new Exception("Invalid role");
        }
        $updates[] = "role = :role";
        $params[':role'] = $input['role'];
    }

    if (isset($input['status'])) {
        if (!in_array($input['status'], ['Active', 'Inactive'])) {
            throw new Exception("Invalid status");
        }
        $updates[] = "status = :status";
        $params[':status'] = $input['status'];
    }

    if (empty($updates)) {
        throw new Exception("No fields to update");
    }

    $query = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->execute($params);

    if ($stmt->rowCount() === 0) {
        throw new Exception("User not found or no changes made");
    }

    echo json_encode([
        'success' => true,
        'message' => 'User updated successfully'
    ]);

} catch (Exception $e) {
    error_log("Update user error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
