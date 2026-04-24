<?php
/**
 * products.php — WooCommerce product CRUD proxy
 *
 * GET    → List all products
 * POST   → Create product
 * PUT    → Update product  (?id=<id>)
 * DELETE → Delete product  (?id=<id>)
 *
 * All requests require: Authorization: Bearer <token>
 */

require_once __DIR__ . '/config.php';

// ── CORS ──────────────────────────────────────────────────
$allowed_origin = defined('FRONTEND_URL') ? FRONTEND_URL : 'https://versuspadel.ar';
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: ' . $allowed_origin);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Vary: Origin');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
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

    // Format: signature:timestamp
    $pos  = strrpos($raw, ':');
    if ($pos === false) return false;
    $sig  = substr($raw, 0, $pos);
    $ts   = (int) substr($raw, $pos + 1);

    // Verify signature
    $expected = hash_hmac('sha256', ADMIN_PASSWORD . ':' . $ts, ADMIN_PASSWORD);
    if (!hash_equals($expected, $sig)) return false;

    // Check expiry
    $maxAge = defined('TOKEN_MAX_AGE') ? TOKEN_MAX_AGE : 86400;
    return (time() - $ts) < $maxAge;
}

if (!validateToken()) {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

// ── Helpers ───────────────────────────────────────────────
function wcAuth(): string {
    return 'Basic ' . base64_encode(WC_CONSUMER_KEY . ':' . WC_CONSUMER_SECRET);
}

function wcBase(): string {
    return rtrim(WC_URL, '/');
}

function wcRequest(string $url, string $method, ?array $body = null): array {
    $ch = curl_init($url);
    $opts = [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST  => $method,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'Authorization: ' . wcAuth(),
        ],
        CURLOPT_TIMEOUT        => 30,
        // SSL verify — true in production (HTTPS), false fallback for HTTP only
        CURLOPT_SSL_VERIFYPEER => (strpos(WC_URL, 'https://') === 0),
        CURLOPT_SSL_VERIFYHOST => (strpos(WC_URL, 'https://') === 0) ? 2 : 0,
    ];

    if ($body !== null) {
        $opts[CURLOPT_POSTFIELDS] = json_encode($body);
    }

    curl_setopt_array($ch, $opts);
    $response = curl_exec($ch);
    $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error    = curl_error($ch);
    curl_close($ch);

    if ($error) {
        http_response_code(502);
        echo json_encode(['error' => 'Error conectando a WooCommerce', 'details' => $error]);
        exit;
    }

    return ['code' => $httpCode, 'body' => $response];
}

// ── Route ─────────────────────────────────────────────────
if (!defined('WC_URL') || !WC_URL) {
    http_response_code(500);
    echo json_encode(['error' => 'WC_URL not configured']);
    exit;
}

$method    = $_SERVER['REQUEST_METHOD'];
$productId = isset($_GET['id']) ? (int) $_GET['id'] : null;
$base      = wcBase();
$input     = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        $result = wcRequest($base . '/wp-json/wc/v3/products?per_page=100&status=publish', 'GET');
        break;
    case 'POST':
        $result = wcRequest($base . '/wp-json/wc/v3/products', 'POST', $input);
        break;
    case 'PUT':
        if (!$productId) { http_response_code(400); echo json_encode(['error' => 'Missing product id']); exit; }
        $result = wcRequest($base . '/wp-json/wc/v3/products/' . $productId, 'PUT', $input);
        break;
    case 'DELETE':
        if (!$productId) { http_response_code(400); echo json_encode(['error' => 'Missing product id']); exit; }
        $result = wcRequest($base . '/wp-json/wc/v3/products/' . $productId . '?force=true', 'DELETE');
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
}

http_response_code($result['code'] ?: 200);
echo $result['body'];
