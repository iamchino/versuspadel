<?php
/**
 * /api/upload-image.php — PHP Backend Endpoint
 *
 * Receives a base64-encoded image from the frontend and uploads it to the
 * WordPress Media Library using WP REST API + Application Passwords.
 *
 * POST { filename: string, data: string (base64), mimeType: string }
 * → 200 { id: number, src: string }
 */

require_once __DIR__ . '/config.php';

// ── CORS ──────────────────────────────────────────────────
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

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

// ── Validate WordPress credentials ────────────────────────
$baseUrl = rtrim(WC_URL, '/');
if (!$baseUrl || !defined('WP_USERNAME') || !defined('WP_APP_PASSWORD')) {
    http_response_code(500);
    echo json_encode(['error' => 'WordPress credentials not configured']);
    exit;
}

// ── Read body ─────────────────────────────────────────────
$input = json_decode(file_get_contents('php://input'), true);
$filename = $input['filename'] ?? '';
$data = $input['data'] ?? '';
$mimeType = $input['mimeType'] ?? '';

if (!$filename || !$data || !$mimeType) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing filename, data, or mimeType']);
    exit;
}

// ── Upload to WordPress ───────────────────────────────────
$imageData = base64_decode($data);
$wpAuth = 'Basic ' . base64_encode(WP_USERNAME . ':' . WP_APP_PASSWORD);

$ch = curl_init($baseUrl . '/wp-json/wp/v2/media');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $imageData,
    CURLOPT_HTTPHEADER => [
        'Authorization: ' . $wpAuth,
        'Content-Type: ' . $mimeType,
        'Content-Disposition: attachment; filename="' . $filename . '"',
    ],
    CURLOPT_TIMEOUT => 60,
    CURLOPT_SSL_VERIFYPEER => true,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    http_response_code(502);
    echo json_encode([
        'error' => 'Error uploading image',
        'details' => $error,
    ]);
    exit;
}

if ($httpCode >= 400) {
    http_response_code($httpCode);
    echo $response;
    exit;
}

$result = json_decode($response, true);
echo json_encode([
    'id' => $result['id'] ?? 0,
    'src' => $result['source_url'] ?? '',
]);
