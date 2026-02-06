<?php
/**
 * Logout Endpoint
 * POST /api/auth/logout
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../includes/cors.php';
require_once __DIR__ . '/../includes/auth.php';

try {
    // Get token from header
    $headers = getallheaders();
    $token = $headers['Authorization'] ?? '';
    $token = str_replace('Bearer ', '', $token);

    if (empty($token)) {
        throw new Exception("Token is required");
    }

    // Logout user
    $auth = new Auth();
    $result = $auth->logout($token);

    echo json_encode($result);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
