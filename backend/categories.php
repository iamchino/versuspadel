<?php
/**
 * categories.php — WooCommerce categories proxy
 *
 * GET → List all product categories
 * Requires: Authorization: Bearer <token>
 */

require_once __DIR__ . '/config.php';

// ── CORS ──────────────────────────────────────────────────
$allowed_origin = defined('FRONTEND_URL') ? FRONTEND_URL : 'https://versuspadel.ar';
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: ' . $allowed_origin);
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Vary: Origin');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// ── Token validation (same HMAC as auth.php) ──────────────
function validateToken(): bool {
    if (!defined('ADMIN_PASSWORD')) return false;
    $headers = getallheaders();
    $auth    = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (!$auth || strpos($auth, 'Bearer ') !== 0) return false;

    $token = substr($auth, 7);
    $raw   = base64_decode($token, true);
    if (!$raw) return false;

    $pos  = strrpos($raw, ':');
    if ($pos === false) return false;
    $sig  = substr($raw, 0, $pos);
    $ts   = (int) substr($raw, $pos + 1);

    $expected = hash_hmac('sha256', ADMIN_PASSWORD . ':' . $ts, ADMIN_PASSWORD);
    if (!hash_equals($expected, $sig)) return false;

    $maxAge = defined('TOKEN_MAX_AGE') ? TOKEN_MAX_AGE : 86400;
    return (time() - $ts) < $maxAge;
}

if (!validateToken()) {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

// ── Call WooCommerce ──────────────────────────────────────
$base = rtrim(WC_URL, '/');
$auth = 'Basic ' . base64_encode(WC_CONSUMER_KEY . ':' . WC_CONSUMER_SECRET);
$useSSL = strpos(WC_URL, 'https://') === 0;

$ch = curl_init($base . '/wp-json/wc/v3/products/categories?per_page=100&hide_empty=false');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'Authorization: ' . $auth,
    ],
    CURLOPT_TIMEOUT        => 30,
    CURLOPT_SSL_VERIFYPEER => $useSSL,
    CURLOPT_SSL_VERIFYHOST => $useSSL ? 2 : 0,
]);

$response = curl_exec($ch);
$httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error    = curl_error($ch);
curl_close($ch);

if ($error) {
    http_response_code(502);
    echo json_encode(['error' => 'Error fetching categories', 'details' => $error]);
    exit;
}

http_response_code($httpCode ?: 200);
echo $response;
