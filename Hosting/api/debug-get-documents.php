<?php
/**
 * Debug version of documents/get.php
 * Access via: https://aqar.winiksolutions.com/api/debug-get-documents.php
 */

// FORCE error display
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

echo "Starting debug...\n\n";

// Step 1: Set header
header('Content-Type: application/json');
echo "1. Header set\n";

// Step 2: Include CORS
echo "2. Including CORS...\n";
try {
    require_once __DIR__ . '/includes/cors.php';
    echo "   ✓ CORS included\n";
} catch (Throwable $e) {
    echo "   ✗ CORS FAILED: " . $e->getMessage() . "\n";
    echo "   File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    die();
}

// Step 3: Include Auth
echo "3. Including Auth...\n";
try {
    require_once __DIR__ . '/includes/auth.php';
    echo "   ✓ Auth included\n";
} catch (Throwable $e) {
    echo "   ✗ Auth FAILED: " . $e->getMessage() . "\n";
    echo "   File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    die();
}

// Step 4: Include Database
echo "4. Including Database...\n";
try {
    require_once __DIR__ . '/config/database.php';
    echo "   ✓ Database included\n";
} catch (Throwable $e) {
    echo "   ✗ Database FAILED: " . $e->getMessage() . "\n";
    echo "   File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    die();
}

// Step 5: Get headers
echo "5. Getting headers...\n";
$headers = getallheaders();
$token = $headers['Authorization'] ?? '';
$token = str_replace('Bearer ', '', $token);
echo "   Token: " . ($token ? substr($token, 0, 20) . '...' : 'NONE') . "\n";

// Step 6: Verify token
echo "6. Verifying token...\n";
try {
    $auth = new Auth();
    $user = $auth->verifyToken($token);
    if (!$user) {
        echo "   ✗ Token invalid or expired\n";
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Unauthorized']);
        die();
    }
    echo "   ✓ User authenticated: " . $user['name'] . "\n";
} catch (Throwable $e) {
    echo "   ✗ Auth verification FAILED: " . $e->getMessage() . "\n";
    echo "   File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    die();
}

// Step 7: Connect to database
echo "7. Connecting to database...\n";
try {
    $database = new Database();
    $db = $database->getConnection();
    echo "   ✓ Database connected\n";
} catch (Throwable $e) {
    echo "   ✗ Database connection FAILED: " . $e->getMessage() . "\n";
    echo "   File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    die();
}

// Step 8: Query documents
echo "8. Querying documents...\n";
try {
    $query = "SELECT * FROM documents WHERE 1=1 ORDER BY date DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $documents = $stmt->fetchAll();
    echo "   ✓ Found " . count($documents) . " documents\n";
} catch (Throwable $e) {
    echo "   ✗ Query FAILED: " . $e->getMessage() . "\n";
    echo "   File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    die();
}

echo "\n✓✓✓ ALL STEPS PASSED ✓✓✓\n\n";

// Return actual JSON response
echo json_encode([
    'success' => true,
    'debug' => 'All steps completed successfully',
    'document_count' => count($documents)
]);
