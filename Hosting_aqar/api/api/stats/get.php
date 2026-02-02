<?php
/**
 * Get Statistics Endpoint
 * GET /api/stats
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

    // Get total counts by status
    $query = "SELECT 
                COUNT(*) as total_documents,
                SUM(CASE WHEN iqac_status = 'Approved' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN iqac_status = 'Pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN iqac_status = 'Rejected' THEN 1 ELSE 0 END) as rejected
              FROM documents";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $totals = $stmt->fetch();

    // Get counts by academic year
    $query = "SELECT academic_year, COUNT(*) as count 
              FROM documents 
              GROUP BY academic_year 
              ORDER BY academic_year DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $byYear = [];
    while ($row = $stmt->fetch()) {
        $byYear[$row['academic_year']] = (int) $row['count'];
    }

    // Get counts by criteria
    $query = "SELECT 
                criteria,
                SUM(CASE WHEN iqac_status = 'Approved' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN iqac_status != 'Approved' THEN 1 ELSE 0 END) as pending
              FROM documents 
              GROUP BY criteria 
              ORDER BY criteria";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $byCriteria = [];
    while ($row = $stmt->fetch()) {
        $byCriteria[$row['criteria']] = [
            'completed' => (int) $row['completed'],
            'pending' => (int) $row['pending']
        ];
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'totalDocuments' => (int) $totals['total_documents'],
            'approved' => (int) $totals['approved'],
            'pending' => (int) $totals['pending'],
            'rejected' => (int) $totals['rejected'],
            'byYear' => $byYear,
            'byCriteria' => $byCriteria
        ]
    ]);

} catch (Exception $e) {
    error_log("Get stats error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to retrieve statistics'
    ]);
}
