<?php
/**
 * CORS Configuration
 * Handles Cross-Origin Resource Sharing
 */

// Load environment variables if not already loaded
if (!defined('ALLOWED_ORIGINS')) {
    if (file_exists(__DIR__ . '/../.env')) {
        $env = parse_ini_file(__DIR__ . '/../.env');
        if (isset($env['ALLOWED_ORIGINS'])) {
            define('ALLOWED_ORIGINS', explode(',', $env['ALLOWED_ORIGINS']));
        } else {
            define('ALLOWED_ORIGINS', ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:3000']);
        }
    } else {
        define('ALLOWED_ORIGINS', ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:3000']);
    }
}

// Get origin from request
$origin = $_SERVER['HTTP_ORIGIN'] ?? $_SERVER['HTTP_REFERER'] ?? '';

// Handle preflight requests first
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Always allow OPTIONS requests
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 3600');
    http_response_code(200);
    exit;
}

// For actual requests, check if origin is allowed
$isAllowed = false;
$allowedOrigin = '';

foreach (ALLOWED_ORIGINS as $allowed) {
    $allowed = trim($allowed);
    if ($origin === $allowed || (substr($allowed, -1) === '*' && strpos($origin, rtrim($allowed, '*')) === 0)) {
        $isAllowed = true;
        $allowedOrigin = $allowed;
        break;
    }
}

// Set CORS headers
// Always set the requesting origin to avoid CORS mismatches
header("Access-Control-Allow-Origin: $origin");

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Max-Age: 3600');
