<?php
/**
 * Database Connection Test - Enhanced Diagnostics
 * Tests if the database connection is working
 */

header('Content-Type: application/json');

$diagnostics = [];

// Test 1: Check .env file
$envPath = __DIR__ . '/../../.env';
$diagnostics['env_file_exists'] = file_exists($envPath);
$diagnostics['env_file_path'] = $envPath;

// Test 2: Check $_ENV variables
$diagnostics['env_variables'] = [
    'DB_HOST' => $_ENV['DB_HOST'] ?? 'NOT SET',
    'DB_NAME' => $_ENV['DB_NAME'] ?? 'NOT SET',
    'DB_USER' => $_ENV['DB_USER'] ?? 'NOT SET',
    'DB_PASSWORD' => isset($_ENV['DB_PASSWORD']) ? '***SET***' : 'NOT SET'
];

// Test 3: Try database connection
try {
    require_once __DIR__ . '/../../config/database.php';
    $database = new Database();
    $db = $database->getConnection();

    // Test query
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
        'diagnostics' => $diagnostics,
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_PRETTY_PRINT);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database connection failed',
        'message' => $e->getMessage(),
        'diagnostics' => $diagnostics,
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_PRETTY_PRINT);
}
