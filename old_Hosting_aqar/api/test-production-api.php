<?php
/**
 * Production API Diagnostic Test
 * Upload this file to: Hosting_aqar/api/test-production-api.php
 * Access at: https://aqar.winiksolutions.com/api/test-production-api.php
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$results = [
    'test' => 'Production API Diagnostic',
    'timestamp' => date('Y-m-d H:i:s'),
    'server' => $_SERVER['HTTP_HOST'] ?? 'unknown',
    'environment' => [],
    'files' => [],
    'database' => [],
    'documents' => []
];

// Check if .env file exists
$envFile = __DIR__ . '/.env';
$results['files']['.env_exists'] = file_exists($envFile);
$results['files']['.env_readable'] = is_readable($envFile);

// Try to load environment variables
if (file_exists($envFile) && is_readable($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0)
            continue;
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            $key = trim($parts[0]);
            $value = trim($parts[1], '"\'');
            $_ENV[$key] = $value;
            putenv("$key=$value");
        }
    }
    $results['environment']['loaded'] = true;
} else {
    $results['environment']['loaded'] = false;
    $results['environment']['error'] = 'Cannot read .env file';
}

// Check environment variables
$results['environment']['DB_HOST'] = $_ENV['DB_HOST'] ?? 'NOT SET';
$results['environment']['DB_NAME'] = $_ENV['DB_NAME'] ?? 'NOT SET';
$results['environment']['DB_USER'] = $_ENV['DB_USER'] ?? 'NOT SET';
$results['environment']['DB_PASSWORD'] = isset($_ENV['DB_PASSWORD']) ? '***SET***' : 'NOT SET';
$results['environment']['APP_ENV'] = $_ENV['APP_ENV'] ?? 'NOT SET';

// Check if database.php exists
$dbFile = __DIR__ . '/config/database.php';
$results['files']['database.php_exists'] = file_exists($dbFile);

// Try database connection
if (file_exists($dbFile)) {
    try {
        require_once $dbFile;
        $database = new Database();
        $db = $database->getConnection();

        $results['database']['connection'] = 'SUCCESS';

        // Count documents
        $stmt = $db->query("SELECT COUNT(*) as total FROM documents");
        $count = $stmt->fetch(PDO::FETCH_ASSOC);
        $results['database']['total_documents'] = $count['total'];

        // Get sample documents
        $stmt = $db->query("SELECT * FROM documents ORDER BY date DESC LIMIT 3");
        $documents = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $results['documents']['count'] = count($documents);
        $results['documents']['sample'] = array_map(function ($doc) {
            return [
                'id' => $doc['id'],
                'criteria' => $doc['criteria'],
                'sub_criteria' => $doc['sub_criteria'],
                'faculty_name' => $doc['faculty_name'],
                'file_name' => $doc['file_name'],
                'iqac_status' => $doc['iqac_status']
            ];
        }, $documents);

    } catch (Exception $e) {
        $results['database']['connection'] = 'FAILED';
        $results['database']['error'] = $e->getMessage();
    }
} else {
    $results['database']['connection'] = 'FAILED';
    $results['database']['error'] = 'database.php not found';
}

// Check API routing files
$results['files']['index.php_exists'] = file_exists(__DIR__ . '/index.php');
$results['files']['.htaccess_exists'] = file_exists(__DIR__ . '/.htaccess');

echo json_encode($results, JSON_PRETTY_PRINT);
