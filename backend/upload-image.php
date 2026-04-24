<?php
/**
 * upload-image.php — WordPress Media Library upload proxy
 *
 * POST { filename: string, data: string (base64), mimeType: string }
 * → 200 { id: number, src: string }
 *
 * Requires: Authorization: Bearer <token>
 * Uses WordPress Application Passwords (WP_USERNAME + WP_APP_PASSWORD)
 */

require_once __DIR__ . '/config.php';

// ── CORS ──────────────────────────────────────────────────
$allowed_origin = defined('FRONTEND_URL') ? FRONTEND_URL : 'https://versuspadel.ar';
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: ' . $allowed_origin);
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Vary: Origin');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// ── Token validation ──────────────────────────────────────
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

// ── Validate WP credentials ───────────────────────────────
$base = rtrim(WC_URL, '/');
if (!$base || !defined('WP_USERNAME') || !WP_USERNAME
           || !defined('WP_APP_PASSWORD') || !WP_APP_PASSWORD
           || WP_APP_PASSWORD === 'your_app_password_here') {
    http_response_code(500);
    echo json_encode(['error' => 'WordPress credentials not configured. Add WP_USERNAME and WP_APP_PASSWORD secrets.']);
    exit;
}

// ── Read body ─────────────────────────────────────────────
$input    = json_decode(file_get_contents('php://input'), true);
$filename = $input['filename'] ?? '';
$data     = $input['data'] ?? '';
$mimeType = $input['mimeType'] ?? '';

if (!$filename || !$data || !$mimeType) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing filename, data, or mimeType']);
    exit;
}

// ── Upload to WordPress Media Library ─────────────────────
$imageData = base64_decode($data);
$wpAuth    = 'Basic ' . base64_encode(WP_USERNAME . ':' . WP_APP_PASSWORD);
$useSSL    = strpos(WC_URL, 'https://') === 0;

$ch = curl_init($base . '/wp-json/wp/v2/media');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $imageData,
    CURLOPT_HTTPHEADER     => [
        'Authorization: ' . $wpAuth,
        'Content-Type: ' . $mimeType,
        'Content-Disposition: attachment; filename="' . basename($filename) . '"',
    ],
    CURLOPT_TIMEOUT        => 60,
    CURLOPT_SSL_VERIFYPEER => $useSSL,
    CURLOPT_SSL_VERIFYHOST => $useSSL ? 2 : 0,
]);

$response = curl_exec($ch);
$httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error    = curl_error($ch);
curl_close($ch);

if ($error) {
    http_response_code(502);
    echo json_encode(['error' => 'Error uploading image', 'details' => $error]);
    exit;
}

if ($httpCode >= 400) {
    http_response_code($httpCode);
    echo $response;
    exit;
}

$result = json_decode($response, true);
echo json_encode([
    'id'  => $result['id'] ?? 0,
    'src' => $result['source_url'] ?? '',
]);
