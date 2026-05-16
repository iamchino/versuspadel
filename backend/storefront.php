<?php
/**
 * storefront.php — Proxy público de la WooCommerce Store API
 *
 * GET /backend/storefront.php?endpoint=products          → lista productos
 * GET /backend/storefront.php?endpoint=products&id=123   → producto individual
 *
 * Cache strategy: 30-second TTL to balance freshness and performance.
 * The _ts parameter still busts WordPress plugin caches (LiteSpeed, W3TC, WPRocket).
 */

require_once __DIR__ . '/middleware.php';

// ── CORS (public endpoint — open to all origins) ─────────
cors_headers('GET, OPTIONS', false);
handle_preflight();
require_method('GET');

// Short cache instead of aggressive no-cache
header('Cache-Control: public, max-age=30');

if (!defined('WC_URL') || !WC_URL) {
    http_response_code(500);
    echo json_encode(['error' => 'WC_URL not configured']);
    exit;
}

// ── Build the Store API URL ───────────────────────────────
$endpoint = $_GET['endpoint'] ?? 'products';
$id       = isset($_GET['id']) ? (int) $_GET['id'] : null;
$page     = isset($_GET['page']) ? (int) $_GET['page'] : 1;
$perPage  = isset($_GET['per_page']) ? (int) $_GET['per_page'] : 100;

$base = wc_base_url();

// Timestamp per request → busts WordPress plugin caches
$ts = time();

switch ($endpoint) {
    case 'products':
        if ($id) {
            $url = "{$base}/wp-json/wc/store/v1/products/{$id}?_ts={$ts}";
        } else {
            $url = "{$base}/wp-json/wc/store/v1/products?per_page={$perPage}&page={$page}&status=publish&_ts={$ts}";
        }
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Unknown endpoint']);
        exit;
}

// ── cURL request ─────────────────────────────────────────
$ssl = wc_use_ssl();

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
    CURLOPT_TIMEOUT        => 15,
    CURLOPT_SSL_VERIFYPEER => $ssl,
    CURLOPT_SSL_VERIFYHOST => $ssl ? 2 : 0,
    CURLOPT_FOLLOWLOCATION => true,
]);

$response = curl_exec($ch);
$httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error    = curl_error($ch);
curl_close($ch);

if ($error) {
    http_response_code(502);
    echo json_encode(['error' => 'Error conectando a WooCommerce', 'details' => $error]);
    exit;
}

// ── Inject featured from local featured.json ─────────────
if (!$id && $httpCode === 200) {
    $featuredFile = __DIR__ . '/featured.json';
    $featuredId   = 0;
    if (file_exists($featuredFile)) {
        $featuredData = json_decode(file_get_contents($featuredFile), true);
        $featuredId   = isset($featuredData['id']) ? (int)$featuredData['id'] : 0;
    }

    $products = json_decode($response, true);
    if (is_array($products) && $featuredId > 0) {
        foreach ($products as &$product) {
            $product['featured'] = ((int)$product['id'] === $featuredId);
        }
        unset($product);
        $response = json_encode($products);
    }
}

http_response_code($httpCode ?: 200);
echo $response;
