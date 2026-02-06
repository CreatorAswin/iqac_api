<?php
/**
 * Database Connection Diagnostic
 * Upload to /public_html/aqar/api/test-db.php
 */

// Enable error display
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

echo "=== Database Connection Test ===\n\n";

// Test 1: Check if .env file exists
$envPath = __DIR__ . '/.env';
echo "1. .env file exists: " . (file_exists($envPath) ? "YES" : "NO") . "\n";
echo "   Path: $envPath\n\n";

// Test 2: Try to read .env file manually
if (file_exists($envPath)) {
    $envContent = file_get_contents($envPath);
    $lines = explode("\n", $envContent);

    echo "2. .env file contents (first 5 lines):\n";
    foreach (array_slice($lines, 0, 5) as $line) {
        echo "   " . trim($line) . "\n";
    }
    echo "\n";

    // Parse .env manually
    $env = [];
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0)
            continue;

        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            $key = trim($parts[0]);
            $value = trim($parts[1], '"\'');
            $env[$key] = $value;
        }
    }

    echo "3. Parsed database credentials:\n";
    echo "   DB_HOST: " . ($env['DB_HOST'] ?? 'NOT FOUND') . "\n";
    echo "   DB_NAME: " . ($env['DB_NAME'] ?? 'NOT FOUND') . "\n";
    echo "   DB_USER: " . ($env['DB_USER'] ?? 'NOT FOUND') . "\n";
    echo "   DB_PASSWORD: " . (isset($env['DB_PASSWORD']) ? str_repeat('*', strlen($env['DB_PASSWORD'])) : 'NOT FOUND') . "\n\n";

    // Test 3: Try database connection with parsed values
    if (isset($env['DB_HOST']) && isset($env['DB_NAME']) && isset($env['DB_USER'])) {
        try {
            $dsn = "mysql:host={$env['DB_HOST']};dbname={$env['DB_NAME']};charset=utf8mb4";
            $pdo = new PDO($dsn, $env['DB_USER'], $env['DB_PASSWORD'] ?? '');
            echo "4. Database connection: SUCCESS ✓\n";
            echo "   Connected to: {$env['DB_NAME']}\n\n";

            // Test 4: Check if users table exists
            $stmt = $pdo->query("SHOW TABLES LIKE 'users'");
            $tableExists = $stmt->rowCount() > 0;
            echo "5. Users table exists: " . ($tableExists ? "YES ✓" : "NO ✗") . "\n";

            if ($tableExists) {
                $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
                $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
                echo "   Users in table: $count\n";
            }

        } catch (PDOException $e) {
            echo "4. Database connection: FAILED ✗\n";
            echo "   Error: " . $e->getMessage() . "\n";
        }
    }
} else {
    echo "ERROR: .env file not found!\n";
    echo "Please upload .env file to: /public_html/aqar/api/.env\n";
}

echo "\n=== End of Test ===\n";
