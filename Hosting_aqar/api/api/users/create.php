<?php
/**
 * Create User Endpoint
 * POST /api/users
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
    $required = ['name', 'email', 'password', 'role'];
    foreach ($required as $field) {
        if (!isset($input[$field]) || empty($input[$field])) {
            throw new Exception("Missing required field: {$field}");
        }
    }

    // Validate role
    $validRoles = ['Admin', 'Management', 'IQAC', 'Faculty'];
    if (!in_array($input['role'], $validRoles)) {
        throw new Exception("Invalid role. Must be one of: " . implode(', ', $validRoles));
    }

    $database = new Database();
    $db = $database->getConnection();

    // Check if email already exists
    $query = "SELECT id FROM users WHERE email = :email";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $input['email']);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        throw new Exception("Email already exists");
    }

    // Hash password
    $hashedPassword = password_hash($input['password'], PASSWORD_BCRYPT);

    // Insert user
    $query = "INSERT INTO users (name, email, password, role, status) 
             VALUES (:name, :email, :password, :role, :status)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':name', $input['name']);
    $stmt->bindParam(':email', $input['email']);
    $stmt->bindParam(':password', $hashedPassword);
    $stmt->bindParam(':role', $input['role']);
    $status = $input['status'] ?? 'Active';
    $stmt->bindParam(':status', $status);
    $stmt->execute();

    $userId = $db->lastInsertId();

    // Fetch created user
    $query = "SELECT id, name, email, role, status FROM users WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $userId);
    $stmt->execute();
    $newUser = $stmt->fetch();

    echo json_encode([
        'success' => true,
        'data' => $newUser,
        'message' => 'User created successfully'
    ]);

} catch (Exception $e) {
    error_log("Create user error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
