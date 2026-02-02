<?php
/**
 * Update Document Status Endpoint
 * PUT /api/documents/update_status
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

// Check if user has permission (IQAC or Management)
if (!in_array($user['role'], ['IQAC', 'Management', 'Admin'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Insufficient permissions']);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'), true);

    // Validate required fields
    if (!isset($input['documentId']) || !isset($input['status'])) {
        throw new Exception("documentId and status are required");
    }

    if (!in_array($input['status'], ['Approved', 'Rejected'])) {
        throw new Exception("Invalid status. Must be 'Approved' or 'Rejected'");
    }

    $database = new Database();
    $db = $database->getConnection();

    // Update document status
    $query = "UPDATE documents SET 
             iqac_status = :status,
             remarks = :remarks,
             approved_by = :approved_by,
             approved_date = NOW()
             WHERE id = :doc_id";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':status', $input['status']);
    $remarks = $input['remarks'] ?? '';
    $stmt->bindParam(':remarks', $remarks);
    $approvedBy = $input['approvedBy'] ?? $user['name'];
    $stmt->bindParam(':approved_by', $approvedBy);
    $stmt->bindParam(':doc_id', $input['documentId']);
    $stmt->execute();

    if ($stmt->rowCount() === 0) {
        throw new Exception("Document not found");
    }

    echo json_encode([
        'success' => true,
        'message' => "Document status updated to {$input['status']}"
    ]);

} catch (Exception $e) {
    error_log("Update status error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
