<?php
/**
 * middleware.php — Shared authentication, CORS, and helper functions
 *
 * Include this file in all backend endpoints to avoid duplicating
 * token validation, CORS headers, and WooCommerce request logic.
 *
 * Usage:
 *   require_once __DIR__ . '/middleware.php';
 *   cors_headers('GET, OPTIONS');           // or 'POST, OPTIONS', etc.
 *   require_auth();                          // blocks unauthenticated requests
 */

require_once __DIR__ . '/config.php';

// ── CORS Headers ─────────────────────────────────────────
function cors_headers(string $methods = 'GET, OPTIONS', bool $restrict_origin = true): void {
    if ($restrict_origin) {
        $origin = defined('FRONTEND_URL') ? FRONTEND_URL : 'https://versuspadel.ar';
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
    } else {
        header('Access-Control-Allow-Origin: *');
    }
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Methods: ' . $methods);
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
}

function handle_preflight(): void {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

function require_method(string|array $allowed): void {
    $allowed = is_array($allowed) ? $allowed : [$allowed];
    if (!in_array($_SERVER['REQUEST_METHOD'], $allowed)) {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }
}

// ── Token Validation ─────────────────────────────────────
function validate_token(): bool {
    if (!defined('ADMIN_PASSWORD')) return false;

    $headers = getallheaders();
    $auth    = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (!$auth || strpos($auth, 'Bearer ') !== 0) return false;

    $token = substr($auth, 7);
    $raw   = base64_decode($token, true);
    if (!$raw) return false;

    // Format: signature:timestamp
    $pos = strrpos($raw, ':');
    if ($pos === false) return false;
    $sig = substr($raw, 0, $pos);
    $ts  = (int) substr($raw, $pos + 1);

    // Verify HMAC signature
    $expected = hash_hmac('sha256', ADMIN_PASSWORD . ':' . $ts, ADMIN_PASSWORD);
    if (!hash_equals($expected, $sig)) return false;

    // Check expiry
    $maxAge = defined('TOKEN_MAX_AGE') ? TOKEN_MAX_AGE : 86400;
    return (time() - $ts) < $maxAge;
}

function require_auth(): void {
    if (!validate_token()) {
        http_response_code(401);
        echo json_encode(['error' => 'No autorizado']);
        exit;
    }
}

// ── WooCommerce Helpers ──────────────────────────────────
function wc_auth_header(): string {
    return 'Basic ' . base64_encode(WC_CONSUMER_KEY . ':' . WC_CONSUMER_SECRET);
}

function wc_base_url(): string {
    return rtrim(WC_URL, '/');
}

function wc_use_ssl(): bool {
    return strpos(WC_URL, 'https://') === 0;
}

/**
 * Generic WooCommerce REST API request.
 *
 * @param string     $url    Full URL to call
 * @param string     $method HTTP method
 * @param array|null $body   JSON body (for POST/PUT)
 * @return array{code: int, body: string}
 */
function wc_request(string $url, string $method, ?array $body = null): array {
    $ssl = wc_use_ssl();

    $ch = curl_init($url);
    $opts = [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST  => $method,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'Authorization: ' . wc_auth_header(),
        ],
        CURLOPT_TIMEOUT        => 30,
        CURLOPT_SSL_VERIFYPEER => $ssl,
        CURLOPT_SSL_VERIFYHOST => $ssl ? 2 : 0,
        CURLOPT_FOLLOWLOCATION => true,
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

/**
 * Simplified GET request helper for WooCommerce.
 */
function wc_get(string $endpoint): array {
    $result = wc_request(wc_base_url() . $endpoint, 'GET');
    if (!$result['body']) return [];
    $decoded = json_decode($result['body'], true);
    return is_array($decoded) ? $decoded : [];
}
