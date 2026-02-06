<?php
/**
 * Delete Document Endpoint
 * DELETE /api/documents/delete
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../includes/cors.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/file_handler.php';
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

try {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['documentId'])) {
        throw new Exception("documentId is required");
    }

    $database = new Database();
    $db = $database->getConnection();

    // Get file path before deleting record
    $query = "SELECT file_path, faculty_id FROM documents WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $input['documentId']);
    $stmt->execute();
    $document = $stmt->fetch();

    if (!$document) {
        throw new Exception("Document not found");
    }

    // Check permissions: only document owner or admin can delete
    if ($user['role'] !== 'Admin' && $document['faculty_id'] !== $user['email']) {
        http_response_code(403);
        throw new Exception("You don't have permission to delete this document");
    }

    // Delete file from storage
    if (!empty($document['file_path'])) {
        $fileHandler = new FileHandler();
        $fileHandler->deleteFile($document['file_path']);
    }

    // Delete database record
    $query = "DELETE FROM documents WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $input['documentId']);
    $stmt->execute();

    echo json_encode([
        'success' => true,
        'message' => 'Document deleted successfully'
    ]);

} catch (Exception $e) {
    error_log("Delete error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
