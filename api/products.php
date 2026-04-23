<?php
/**
 * /api/products.php — PHP Backend Endpoint
 *
 * Secure proxy to WooCommerce REST API v3 for product CRUD.
 * Credentials (WC_CONSUMER_KEY / SECRET) stay on the server.
 *
 * GET    → List all products
 * POST   → Create a new product
 * PUT    → Update a product (requires ?id=<product_id>)
 * DELETE → Delete a product (requires ?id=<product_id>)
 *
 * All requests require Authorization: Bearer <token> header.
 */

require_once __DIR__ . '/config.php';

// ── CORS ──────────────────────────────────────────────────
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
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

        // Check token expiry (24 hours)
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

// ── Helpers ───────────────────────────────────────────────
function getWcAuth(): string {
    return 'Basic ' . base64_encode(WC_CONSUMER_KEY . ':' . WC_CONSUMER_SECRET);
}

function getBaseUrl(): string {
    return rtrim(WC_URL, '/');
}

// ── Route request ─────────────────────────────────────────
$method = $_SERVER['REQUEST_METHOD'];
$productId = $_GET['id'] ?? null;
$baseUrl = getBaseUrl();

if (!$baseUrl) {
    http_response_code(500);
    echo json_encode(['error' => 'WC_URL not configured']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        $wcUrl = $baseUrl . '/wp-json/wc/v3/products?per_page=100';
        break;
    case 'POST':
        $wcUrl = $baseUrl . '/wp-json/wc/v3/products';
        break;
    case 'PUT':
        if (!$productId) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing product id']);
            exit;
        }
        $wcUrl = $baseUrl . '/wp-json/wc/v3/products/' . intval($productId);
        break;
    case 'DELETE':
        if (!$productId) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing product id']);
            exit;
        }
        $wcUrl = $baseUrl . '/wp-json/wc/v3/products/' . intval($productId) . '?force=true';
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
}

// ── Call WooCommerce ──────────────────────────────────────
$ch = curl_init($wcUrl);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CUSTOMREQUEST => $method,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: ' . getWcAuth(),
    ],
    CURLOPT_TIMEOUT => 30,
    CURLOPT_SSL_VERIFYPEER => true,
]);

if (in_array($method, ['POST', 'PUT']) && $input) {
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($input));
}

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    http_response_code(502);
    echo json_encode([
        'error' => 'Error connecting to WooCommerce',
        'details' => $error,
    ]);
    exit;
}

http_response_code($httpCode ?: 200);
echo $response;
