<?php
/**
 * Simple Test Endpoint
 * Access: https://aqar.winiksolutions.com/api/simple-test.php
 */

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

$result = [
    'test' => 'Simple Test',
    'status' => 'PASS',
    'timestamp' => date('Y-m-d H:i:s'),
    'tests' => []
];

// Test 1: Basic PHP
$result['tests']['php_works'] = 'PASS';

// Test 2: Check if files exist
$result['tests']['files_exist'] = [
    'config_database' => file_exists(__DIR__ . '/config/database.php') ? 'EXISTS' : 'MISSING',
    'includes_cors' => file_exists(__DIR__ . '/includes/cors.php') ? 'EXISTS' : 'MISSING',
    'includes_auth' => file_exists(__DIR__ . '/includes/auth.php') ? 'EXISTS' : 'MISSING',
    'documents_get' => file_exists(__DIR__ . '/documents/get.php') ? 'EXISTS' : 'MISSING'
];

// Test 3: Try to include config
try {
    require_once __DIR__ . '/config/database.php';
    $result['tests']['include_database'] = 'PASS';
} catch (Exception $e) {
    $result['tests']['include_database'] = 'FAIL: ' . $e->getMessage();
}

// Test 4: Try database connection
try {
    $database = new Database();
    $db = $database->getConnection();
    $result['tests']['database_connection'] = 'PASS';
    
    // Test 5: Try to query
    $stmt = $db->query("SELECT 1");
    $result['tests']['database_query'] = 'PASS';
} catch (Exception $e) {
    $result['tests']['database_connection'] = 'FAIL: ' . $e->getMessage();
}

echo json_encode($result, JSON_PRETTY_PRINT);
