<?php
/**
 * Test GET Documents Endpoint
 * Upload to: Hosting_aqar/api/test-get-documents.php
 * Access at: https://aqar.winiksolutions.com/api/test-get-documents.php
 * 
 * This script tests the documents GET endpoint without authentication
 * to help diagnose why documents are not showing
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$results = [
    'test' => 'GET Documents Endpoint Diagnostic',
    'timestamp' => date('Y-m-d H:i:s'),
    'environment' => [],
    'database' => [],
    'query_test' => []
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
    $results['environment']['loaded'] = true;
} else {
    $results['environment']['loaded'] = false;
}

$results['environment']['DB_NAME'] = $_ENV['DB_NAME'] ?? 'NOT SET';
$results['environment']['DB_USER'] = $_ENV['DB_USER'] ?? 'NOT SET';

try {
    require_once __DIR__ . '/config/database.php';
    $database = new Database();
    $db = $database->getConnection();

    $results['database']['connection'] = 'SUCCESS';

    // Test the exact query from get.php
    $query = "SELECT * FROM documents WHERE 1=1 ORDER BY date DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $documents = $stmt->fetchAll();

    $results['query_test']['total_documents'] = count($documents);
    $results['query_test']['query'] = $query;

    // Show first 3 documents with all fields
    $results['query_test']['sample_raw'] = array_slice($documents, 0, 3);

    // Transform like the API does
    $transformedDocuments = array_map(function ($doc) {
        return [
            'id' => (string) $doc['id'],
            'date' => $doc['date'],
            'criteria' => $doc['criteria'],
            'subCriteria' => $doc['sub_criteria'],
            'facultyName' => $doc['faculty_name'],
            'facultyId' => $doc['faculty_id'],
            'academicYear' => $doc['academic_year'],
            'documentUrl' => $doc['document_url'],
            'fileName' => $doc['file_name'],
            'uploadStatus' => $doc['upload_status'],
            'iqacStatus' => $doc['iqac_status'],
            'remarks' => $doc['remarks'] ?? '',
            'approvedBy' => $doc['approved_by'] ?? null,
            'approvedDate' => $doc['approved_date'] ?? null
        ];
    }, array_slice($documents, 0, 3));

    $results['query_test']['sample_transformed'] = $transformedDocuments;

    // Test with filters
    $testFilters = [
        'no_filter' => "SELECT COUNT(*) as count FROM documents WHERE 1=1",
        'with_status_pending' => "SELECT COUNT(*) as count FROM documents WHERE iqac_status = 'Pending'",
        'with_status_approved' => "SELECT COUNT(*) as count FROM documents WHERE iqac_status = 'Approved'",
    ];

    foreach ($testFilters as $name => $sql) {
        $stmt = $db->query($sql);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $results['query_test']['filters'][$name] = $result['count'];
    }

    // Check table structure
    $stmt = $db->query("DESCRIBE documents");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $results['database']['columns'] = array_column($columns, 'Field');

} catch (Exception $e) {
    $results['database']['connection'] = 'FAILED';
    $results['database']['error'] = $e->getMessage();
    $results['database']['trace'] = $e->getTraceAsString();
}

echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
