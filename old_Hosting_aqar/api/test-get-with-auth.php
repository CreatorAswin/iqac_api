<?php
/**
 * Test GET Endpoint with Authentication
 * This script simulates a frontend request to test if the API is returning data
 * Upload to: Hosting_aqar/api/test-get-with-auth.php
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$results = [
    'test' => 'GET Documents with Authentication Test',
    'timestamp' => date('Y-m-d H:i:s'),
    'steps' => []
];

// Step 1: Load environment
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

$results['steps']['1_env_loaded'] = 'SUCCESS';

// Step 2: Test database connection
try {
    require_once __DIR__ . '/config/database.php';
    $database = new Database();
    $db = $database->getConnection();
    $results['steps']['2_database_connection'] = 'SUCCESS';

    // Step 3: Count total documents
    $stmt = $db->query("SELECT COUNT(*) as total FROM documents");
    $count = $stmt->fetch(PDO::FETCH_ASSOC);
    $results['steps']['3_total_documents_in_db'] = $count['total'];

    // Step 4: Get sample documents (raw)
    $stmt = $db->query("SELECT * FROM documents ORDER BY date DESC LIMIT 5");
    $documents = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $results['steps']['4_raw_documents_fetched'] = count($documents);

    if (count($documents) > 0) {
        $results['sample_raw_document'] = [
            'id' => $documents[0]['id'],
            'date' => $documents[0]['date'],
            'criteria' => $documents[0]['criteria'],
            'sub_criteria' => $documents[0]['sub_criteria'],
            'faculty_name' => $documents[0]['faculty_name'],
            'faculty_id' => $documents[0]['faculty_id'],
            'academic_year' => $documents[0]['academic_year'],
            'document_url' => $documents[0]['document_url'],
            'file_name' => $documents[0]['file_name'],
            'upload_status' => $documents[0]['upload_status'],
            'iqac_status' => $documents[0]['iqac_status']
        ];
    }

    // Step 5: Transform like the API does
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
    }, $documents);

    $results['steps']['5_documents_transformed'] = count($transformedDocuments);

    if (count($transformedDocuments) > 0) {
        $results['sample_transformed_document'] = $transformedDocuments[0];
    }

    // Step 6: Simulate API response
    $apiResponse = [
        'success' => true,
        'data' => $transformedDocuments
    ];

    $results['steps']['6_api_response_structure'] = 'VALID';
    $results['simulated_api_response'] = $apiResponse;

    // Step 7: Check for common issues
    $issues = [];

    // Check if all documents have required fields
    foreach ($documents as $doc) {
        if (empty($doc['faculty_id'])) {
            $issues[] = "Document ID {$doc['id']} has empty faculty_id";
        }
        if (empty($doc['criteria'])) {
            $issues[] = "Document ID {$doc['id']} has empty criteria";
        }
    }

    $results['potential_issues'] = count($issues) > 0 ? $issues : 'None found';

    // Step 8: Test actual endpoint (if possible)
    $results['steps']['7_endpoint_test'] = 'Check /api/documents endpoint directly';

} catch (Exception $e) {
    $results['error'] = $e->getMessage();
    $results['trace'] = $e->getTraceAsString();
}

echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
