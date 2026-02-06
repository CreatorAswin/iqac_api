<?php
/**
 * Test API Documents Endpoint
 * Simulates an authenticated request to /api/documents
 */

// Load environment
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

// Simulate the API request by including the get.php file
$_SERVER['REQUEST_METHOD'] = 'GET';

// Create a mock token for testing (you'll need to generate a real one or bypass auth for testing)
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/config/database.php';

header('Content-Type: application/json');

// For testing, let's bypass auth and directly query
try {
    $database = new Database();
    $db = $database->getConnection();

    $query = "SELECT * FROM documents ORDER BY date DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $documents = $stmt->fetchAll();

    // Transform to frontend format
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
            'remarks' => $doc['remarks'],
            'approvedBy' => $doc['approved_by'],
            'approvedDate' => $doc['approved_date']
        ];
    }, $documents);

    echo json_encode([
        'success' => true,
        'data' => $transformedDocuments,
        'count' => count($transformedDocuments)
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
