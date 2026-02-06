<?php
/**
 * Enhanced Production Database Diagnostic
 * Upload to: Hosting_aqar/api/check-documents-table.php
 * Access at: https://aqar.winiksolutions.com/api/check-documents-table.php
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$results = [
    'test' => 'Production Documents Table Check',
    'timestamp' => date('Y-m-d H:i:s'),
    'environment' => [],
    'database' => [],
    'tables' => [],
    'documents' => []
];

// Load environment
$envFile = __DIR__ . '/.env';
if (file_exists($envFile)) {
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
}

$results['environment']['DB_NAME'] = $_ENV['DB_NAME'] ?? 'NOT SET';
$results['environment']['DB_USER'] = $_ENV['DB_USER'] ?? 'NOT SET';

try {
    require_once __DIR__ . '/config/database.php';
    $database = new Database();
    $db = $database->getConnection();

    $results['database']['connection'] = 'SUCCESS';

    // List all tables in database
    $stmt = $db->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $results['tables']['list'] = $tables;
    $results['tables']['count'] = count($tables);

    // Check if documents table exists
    $results['tables']['documents_exists'] = in_array('documents', $tables);

    if (in_array('documents', $tables)) {
        // Get documents table structure
        $stmt = $db->query("DESCRIBE documents");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $results['documents']['columns'] = array_column($columns, 'Field');

        // Count documents
        $stmt = $db->query("SELECT COUNT(*) as total FROM documents");
        $count = $stmt->fetch(PDO::FETCH_ASSOC);
        $results['documents']['total_count'] = $count['total'];

        // Get sample documents
        $stmt = $db->query("SELECT * FROM documents ORDER BY date DESC LIMIT 3");
        $docs = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $results['documents']['sample'] = $docs;

        // Count by status
        $stmt = $db->query("SELECT iqac_status, COUNT(*) as count FROM documents GROUP BY iqac_status");
        $statusCounts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $results['documents']['by_status'] = $statusCounts;
    }

    // Check assignments table too
    if (in_array('assignments', $tables)) {
        $stmt = $db->query("SELECT COUNT(*) as total FROM assignments");
        $count = $stmt->fetch(PDO::FETCH_ASSOC);
        $results['tables']['assignments_count'] = $count['total'];
    }

} catch (Exception $e) {
    $results['database']['connection'] = 'FAILED';
    $results['database']['error'] = $e->getMessage();
}

echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
