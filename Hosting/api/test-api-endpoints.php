<?php
/**
 * API Diagnostic Test Script
 * Test this by accessing: https://aqar.winiksolutions.com/api/test-api-endpoints.php
 */

header('Content-Type: application/json');

$results = [
    'timestamp' => date('Y-m-d H:i:s'),
    'tests' => []
];

// Test 1: Check if we can load this file
$results['tests']['script_loaded'] = [
    'status' => 'PASS',
    'message' => 'Diagnostic script loaded successfully'
];

// Test 2: Check directory structure
$results['tests']['directory_structure'] = [
    'status' => file_exists(__DIR__ . '/documents/get.php') ? 'PASS' : 'FAIL',
    'documents_exists' => file_exists(__DIR__ . '/documents/get.php'),
    'assignments_exists' => file_exists(__DIR__ . '/assignments/get.php'),
    'auth_exists' => file_exists(__DIR__ . '/auth/login.php'),
    'index_exists' => file_exists(__DIR__ . '/index.php')
];

// Test 3: Check .env file
$results['tests']['env_file'] = [
    'status' => file_exists(__DIR__ . '/.env') ? 'PASS' : 'FAIL',
    'exists' => file_exists(__DIR__ . '/.env'),
    'readable' => is_readable(__DIR__ . '/.env')
];

// Test 4: Check database connection
try {
    require_once __DIR__ . '/config/database.php';
    $database = new Database();
    $db = $database->getConnection();
    $results['tests']['database'] = [
        'status' => 'PASS',
        'message' => 'Database connection successful'
    ];
} catch (Exception $e) {
    $results['tests']['database'] = [
        'status' => 'FAIL',
        'error' => $e->getMessage()
    ];
}

// Test 5: Check if we can query documents table
try {
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM documents");
    $stmt->execute();
    $row = $stmt->fetch();
    $results['tests']['documents_table'] = [
        'status' => 'PASS',
        'count' => $row['count'],
        'message' => 'Found ' . $row['count'] . ' documents in database'
    ];
} catch (Exception $e) {
    $results['tests']['documents_table'] = [
        'status' => 'FAIL',
        'error' => $e->getMessage()
    ];
}

// Test 6: Check if we can query assignments table
try {
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM assignments");
    $stmt->execute();
    $row = $stmt->fetch();
    $results['tests']['assignments_table'] = [
        'status' => 'PASS',
        'count' => $row['count'],
        'message' => 'Found ' . $row['count'] . ' assignments in database'
    ];
} catch (Exception $e) {
    $results['tests']['assignments_table'] = [
        'status' => 'FAIL',
        'error' => $e->getMessage()
    ];
}

// Test 7: Check CORS configuration
$results['tests']['cors'] = [
    'status' => file_exists(__DIR__ . '/includes/cors.php') ? 'PASS' : 'FAIL',
    'file_exists' => file_exists(__DIR__ . '/includes/cors.php')
];

// Test 8: Check .htaccess
$results['tests']['htaccess'] = [
    'status' => file_exists(__DIR__ . '/.htaccess') ? 'PASS' : 'FAIL',
    'exists' => file_exists(__DIR__ . '/.htaccess'),
    'readable' => is_readable(__DIR__ . '/.htaccess')
];

// Test 9: Check PHP version
$results['tests']['php_version'] = [
    'status' => version_compare(PHP_VERSION, '7.4.0', '>=') ? 'PASS' : 'WARN',
    'version' => PHP_VERSION,
    'required' => '7.4.0+'
];

// Test 10: Check required PHP extensions
$required_extensions = ['pdo', 'pdo_mysql', 'json'];
$missing_extensions = [];
foreach ($required_extensions as $ext) {
    if (!extension_loaded($ext)) {
        $missing_extensions[] = $ext;
    }
}
$results['tests']['php_extensions'] = [
    'status' => empty($missing_extensions) ? 'PASS' : 'FAIL',
    'required' => $required_extensions,
    'missing' => $missing_extensions
];

// Summary
$failed_tests = 0;
foreach ($results['tests'] as $test) {
    if (isset($test['status']) && $test['status'] === 'FAIL') {
        $failed_tests++;
    }
}

$results['summary'] = [
    'total_tests' => count($results['tests']),
    'failed' => $failed_tests,
    'passed' => count($results['tests']) - $failed_tests,
    'overall_status' => $failed_tests === 0 ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'
];

echo json_encode($results, JSON_PRETTY_PRINT);
