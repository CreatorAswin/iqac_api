<?php
/**
 * AQAR Hub API Router
 * Main entry point for all API requests
 */

// Load Composer autoloader if available
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require_once __DIR__ . '/vendor/autoload.php';

    // Load environment variables if Dotenv is available
    if (class_exists('Dotenv\\Dotenv')) {
        $dotEnvClass = 'Dotenv\\Dotenv';
        $dotenv = $dotEnvClass::createImmutable(__DIR__);
        $dotenv->load();
    }
} else {
    // Fallback: manually load .env file if it exists
    $envFiles = [
        __DIR__ . '/.env',
        __DIR__ . '/../.env'
    ];
    
    foreach ($envFiles as $envFile) {
        if (file_exists($envFile)) {
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
                    list($key, $value) = explode('=', $line, 2);
                    $key = trim($key);
                    $value = trim($value);
                    if (!empty($key)) {
                        putenv(sprintf('%s=%s', $key, $value));
                        $_ENV[$key] = $value;
                        $_SERVER[$key] = $value;
                    }
                }
            }
        }
    }
}

// Load configuration
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/includes/cors.php';

// Set content type
header('Content-Type: application/json');

// Get request method and path
$requestMethod = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'];

// Remove query string
$path = parse_url($requestUri, PHP_URL_PATH);

// Remove /aqar/backend from path if present (XAMPP subdirectory)
$path = preg_replace('#^/aqar/backend#', '', $path);

// Remove /aqar-hub-backend from path if present (XAMPP subdirectory)
$path = preg_replace('#^/aqar-hub-backend#', '', $path);

// Remove /backend from path if present
$path = preg_replace('#^/backend#', '', $path);

// Remove /api from path if present
$path = preg_replace('#^/api#', '', $path);

// Clean up path
$path = trim($path, '/');

// Route mapping
$routes = [
    // Authentication
    'POST /auth/login' => 'api/auth/login.php',
    'POST /auth/logout' => 'api/auth/logout.php',
    'GET /auth/verify' => 'api/auth/verify.php',

    // Documents
    'GET /documents' => 'api/documents/get.php',
    'POST /documents/upload' => 'api/documents/upload.php',
    'PUT /documents/update_status' => 'api/documents/update_status.php',
    'DELETE /documents/delete' => 'api/documents/delete.php',

    // Users
    'GET /users' => 'api/users/get.php',
    'POST /users' => 'api/users/create.php',
    'PUT /users' => 'api/users/update.php',
    'DELETE /users' => 'api/users/delete.php',

    // Assignments
    'GET /assignments' => 'api/assignments/get.php',
    'POST /assignments' => 'api/assignments/create.php',
    'DELETE /assignments' => 'api/assignments/delete.php',

    // Statistics
    'GET /stats' => 'api/stats/get.php',

    // Test endpoints
    'GET /test/db' => 'api/test/db.php',
];

// Build route key
$routeKey = $requestMethod . ' /' . $path;

// Check if route exists
if (isset($routes[$routeKey])) {
    $file = __DIR__ . '/' . $routes[$routeKey];

    if (file_exists($file)) {
        require_once $file;
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Route handler file not found'
        ]);
    }
} else {
    // Route not found
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'error' => 'Route not found: ' . $routeKey,
        'available_routes' => array_keys($routes)
    ]);
}
