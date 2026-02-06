<?php
/**
 * Database Connection Test
 * Tests if the database connection is working
 */

require_once __DIR__ . '/../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    // Test query to check if database exists and is accessible
    $query = "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = :db_name";
    $stmt = $db->prepare($query);
    $stmt->bindValue(':db_name', $_ENV['DB_NAME'] ?? 'aqar_hub');
    $stmt->execute();
    $result = $stmt->fetch();

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Database connection successful',
        'database' => $_ENV['DB_NAME'] ?? 'aqar_hub',
        'tables_count' => $result['table_count'],
        'timestamp' => date('Y-m-d H:i:s')
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database connection failed',
        'message' => $e->getMessage()
    ]);
}
