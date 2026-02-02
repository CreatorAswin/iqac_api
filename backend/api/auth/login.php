<?php
/**
 * Login Endpoint
 * POST /api/auth/login
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../../includes/cors.php';
require_once __DIR__ . '/../../includes/auth.php';

try {
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);

    // Validate required fields
    if (!isset($input['email']) || !isset($input['password'])) {
        throw new Exception("Email and password are required");
    }

    // Authenticate user
    $auth = new Auth();
    $result = $auth->login($input['email'], $input['password']);

    if (!$result['success']) {
        http_response_code(401);
    }

    echo json_encode($result);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
