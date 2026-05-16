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

require_once __DIR__ . '/middleware.php';

// ── Setup ────────────────────────────────────────────────
cors_headers('POST, OPTIONS');
handle_preflight();
require_method('POST');
require_auth();

// ── Validate WP credentials ───────────────────────────────
$base = wc_base_url();
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

// ── Validate file type and size ───────────────────────────
$allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
if (!in_array($mimeType, $allowedMimes)) {
    http_response_code(400);
    echo json_encode(['error' => 'Tipo de archivo no permitido. Solo se aceptan: JPEG, PNG, GIF, WebP, SVG.']);
    exit;
}

$imageData = base64_decode($data);
if (!$imageData) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos de imagen inválidos']);
    exit;
}

// Max 5MB
$maxSize = 5 * 1024 * 1024;
if (strlen($imageData) > $maxSize) {
    http_response_code(400);
    echo json_encode(['error' => 'La imagen supera el tamaño máximo de 5MB.']);
    exit;
}

// ── Upload to WordPress Media Library ─────────────────────
$wpAuth = 'Basic ' . base64_encode(WP_USERNAME . ':' . WP_APP_PASSWORD);
$ssl    = wc_use_ssl();

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
    CURLOPT_SSL_VERIFYPEER => $ssl,
    CURLOPT_SSL_VERIFYHOST => $ssl ? 2 : 0,
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
