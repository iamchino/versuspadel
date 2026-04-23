<?php
/**
 * /api/categories.php — PHP Backend Endpoint
 *
 * Fetches product categories from WooCommerce REST API v3.
 * Used to populate the category dropdown in the admin product form.
 *
 * GET → List all categories
 */

require_once __DIR__ . '/config.php';

// ── CORS ──────────────────────────────────────────────────
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// ── Token validation ──────────────────────────────────────
function validateToken(): bool {
    $headers = getallheaders();
    $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (!$auth || strpos($auth, 'Bearer ') !== 0) return false;

    $token = substr($auth, 7);
    try {
        $decoded = base64_decode($token, true);
        if ($decoded === false) return false;

        $parts = explode(':', $decoded, 2);
        $password = $parts[0] ?? '';
        $timestamp = $parts[1] ?? '';

        if ($password !== ADMIN_PASSWORD) return false;

        if ($timestamp) {
            $age = (time() * 1000) - intval($timestamp);
            if ($age > TOKEN_MAX_AGE * 1000) return false;
        }

        return true;
    } catch (Exception $e) {
        return false;
    }
}

if (!validateToken()) {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

// ── Call WooCommerce ──────────────────────────────────────
$baseUrl = rtrim(WC_URL, '/');
$auth = 'Basic ' . base64_encode(WC_CONSUMER_KEY . ':' . WC_CONSUMER_SECRET);

$ch = curl_init($baseUrl . '/wp-json/wc/v3/products/categories?per_page=100');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: ' . $auth,
    ],
    CURLOPT_TIMEOUT => 30,
    CURLOPT_SSL_VERIFYPEER => true,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    http_response_code(502);
    echo json_encode([
        'error' => 'Error fetching categories',
        'details' => $error,
    ]);
    exit;
}

http_response_code($httpCode ?: 200);
echo $response;
