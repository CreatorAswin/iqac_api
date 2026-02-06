<?php
/**
 * Test Local Backend API
 * Verify backend/api/documents/get.php works correctly
 */

// Load environment from backend folder
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

require_once __DIR__ . '/config/database.php';
header('Content-Type: application/json');

$results = [
    'test' => 'Local Backend API Test',
    'timestamp' => date('Y-m-d H:i:s'),
    'environment' => [
        'DB_NAME' => $_ENV['DB_NAME'] ?? 'NOT SET',
        'DB_USER' => $_ENV['DB_USER'] ?? 'NOT SET',
    ],
    'database' => [],
    'documents' => []
];

try {
    $database = new Database();
    $db = $database->getConnection();

    $results['database']['connection'] = 'SUCCESS';

    // Count documents
    $stmt = $db->query("SELECT COUNT(*) as total FROM documents");
    $count = $stmt->fetch();
    $results['database']['total_documents'] = $count['total'];

    // Get sample documents
    $stmt = $db->query("SELECT * FROM documents ORDER BY date DESC LIMIT 3");
    $documents = $stmt->fetchAll();

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

echo json_encode($results, JSON_PRETTY_PRINT);
