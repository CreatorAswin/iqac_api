<?php
/**
 * API Diagnostic Test Script
 * Tests database connection and document retrieval
 */

// Load environment variables - check .env.local first, then .env
$envFile = __DIR__ . '/.env.local';
if (!file_exists($envFile)) {
    $envFile = __DIR__ . '/.env';
}

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

header('Content-Type: application/json');

$results = [
    'timestamp' => date('Y-m-d H:i:s'),
    'environment' => [],
    'database' => [],
    'documents' => []
];

// Check environment variables
$results['environment']['DB_HOST'] = $_ENV['DB_HOST'] ?? 'NOT SET';
$results['environment']['DB_NAME'] = $_ENV['DB_NAME'] ?? 'NOT SET';
$results['environment']['DB_USER'] = $_ENV['DB_USER'] ?? 'NOT SET';
$results['environment']['DB_PASSWORD'] = isset($_ENV['DB_PASSWORD']) ? '***SET***' : 'NOT SET';

// Test database connection
try {
    $db = new PDO(
        "mysql:host=" . $_ENV['DB_HOST'] . ";dbname=" . $_ENV['DB_NAME'] . ";charset=utf8mb4",
        $_ENV['DB_USER'],
        $_ENV['DB_PASSWORD'],
        array(
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        )
    );

    $results['database']['connection'] = 'SUCCESS';

    // Count documents
    $stmt = $db->query("SELECT COUNT(*) as total FROM documents");
    $count = $stmt->fetch();
    $results['database']['total_documents'] = $count['total'];

    // Get sample documents
    $stmt = $db->query("SELECT * FROM documents ORDER BY date DESC LIMIT 5");
    $documents = $stmt->fetchAll();

    $results['documents']['count'] = count($documents);
    $results['documents']['sample'] = array_map(function ($doc) {
        return [
            'id' => $doc['id'],
            'date' => $doc['date'],
            'criteria' => $doc['criteria'],
            'sub_criteria' => $doc['sub_criteria'],
            'faculty_name' => $doc['faculty_name'],
            'academic_year' => $doc['academic_year'],
            'file_name' => $doc['file_name'],
            'document_url' => $doc['document_url'],
            'iqac_status' => $doc['iqac_status']
        ];
    }, $documents);

    // Check for empty or null document_urls
    $stmt = $db->query("SELECT COUNT(*) as count FROM documents WHERE document_url IS NULL OR document_url = ''");
    $nullUrls = $stmt->fetch();
    $results['documents']['null_or_empty_urls'] = $nullUrls['count'];

} catch (PDOException $e) {
    $results['database']['connection'] = 'FAILED';
    $results['database']['error'] = $e->getMessage();
}

echo json_encode($results, JSON_PRETTY_PRINT);
