<?php
/**
 * Debug Endpoint - Shows actual PHP errors
 * Access: https://aqar.winiksolutions.com/api/debug-documents.php
 */

// Force error display
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

header('Content-Type: text/plain');

echo "=== DEBUG: Documents Endpoint ===\n\n";

// Test 1: Check current directory
echo "1. Current Directory: " . __DIR__ . "\n";
echo "   Files in current dir:\n";
foreach (scandir(__DIR__) as $file) {
    if ($file != '.' && $file != '..') {
        echo "   - $file\n";
    }
}
echo "\n";

// Test 2: Check if documents directory exists
echo "2. Documents directory exists: " . (is_dir(__DIR__ . '/documents') ? 'YES' : 'NO') . "\n";
if (is_dir(__DIR__ . '/documents')) {
    echo "   Files in documents/:\n";
    foreach (scandir(__DIR__ . '/documents') as $file) {
        if ($file != '.' && $file != '..') {
            echo "   - $file\n";
        }
    }
}
echo "\n";

// Test 3: Check include paths
echo "3. Testing include paths:\n";
echo "   ../includes/cors.php exists: " . (file_exists(__DIR__ . '/../includes/cors.php') ? 'YES' : 'NO') . "\n";
echo "   includes/cors.php exists: " . (file_exists(__DIR__ . '/includes/cors.php') ? 'YES' : 'NO') . "\n";
echo "   ../config/database.php exists: " . (file_exists(__DIR__ . '/../config/database.php') ? 'YES' : 'NO') . "\n";
echo "   config/database.php exists: " . (file_exists(__DIR__ . '/config/database.php') ? 'YES' : 'NO') . "\n";
echo "\n";

// Test 4: Try to include files like documents/get.php does
echo "4. Attempting to include files:\n";
try {
    require_once __DIR__ . '/../includes/cors.php';
    echo "   ✓ cors.php included successfully\n";
} catch (Exception $e) {
    echo "   ✗ cors.php FAILED: " . $e->getMessage() . "\n";
}

try {
    require_once __DIR__ . '/../includes/auth.php';
    echo "   ✓ auth.php included successfully\n";
} catch (Exception $e) {
    echo "   ✗ auth.php FAILED: " . $e->getMessage() . "\n";
}

try {
    require_once __DIR__ . '/../config/database.php';
    echo "   ✓ database.php included successfully\n";
} catch (Exception $e) {
    echo "   ✗ database.php FAILED: " . $e->getMessage() . "\n";
}
echo "\n";

// Test 5: Try database connection
echo "5. Testing database connection:\n";
try {
    $database = new Database();
    $db = $database->getConnection();
    echo "   ✓ Database connected successfully\n";
} catch (Exception $e) {
    echo "   ✗ Database connection FAILED: " . $e->getMessage() . "\n";
}
echo "\n";

// Test 6: Simulate what documents/get.php does
echo "6. Simulating documents/get.php:\n";
echo "   This is what the actual endpoint would do...\n";

echo "\n=== END DEBUG ===\n";
