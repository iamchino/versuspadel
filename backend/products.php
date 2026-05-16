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

require_once __DIR__ . '/middleware.php';

// ── Setup ────────────────────────────────────────────────
cors_headers('GET, POST, PUT, DELETE, OPTIONS');
handle_preflight();
require_auth();

// ── Route ─────────────────────────────────────────────────
if (!defined('WC_URL') || !WC_URL) {
    http_response_code(500);
    echo json_encode(['error' => 'WC_URL not configured']);
    exit;
}

$method    = $_SERVER['REQUEST_METHOD'];
$productId = isset($_GET['id']) ? (int) $_GET['id'] : null;
$base      = wc_base_url();
$input     = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        // Fetch ALL products regardless of status
        $ts = time();
        $result = wc_request($base . '/wp-json/wc/v3/products?per_page=100&status=any&orderby=date&order=desc&_ts=' . $ts, 'GET');
        break;
    case 'POST':
        $result = wc_request($base . '/wp-json/wc/v3/products', 'POST', $input);
        break;
    case 'PUT':
        if (!$productId) { http_response_code(400); echo json_encode(['error' => 'Missing product id']); exit; }

        // ── Local featured.json — source of truth, bypasses WC cache ──
        $featuredFile = __DIR__ . '/featured.json';
        if (isset($input['featured'])) {
            if ($input['featured'] === true) {
                file_put_contents($featuredFile, json_encode([
                    'id'         => $productId,
                    'updated_at' => date('c'),
                ]));
            } else {
                // Un-featuring this product: clear the file if it was pointing here
                $current = json_decode(file_get_contents($featuredFile), true);
                if (isset($current['id']) && (int)$current['id'] === $productId) {
                    file_put_contents($featuredFile, json_encode(['id' => 0, 'updated_at' => date('c')]));
                }
            }
            // Don't send featured to WooCommerce — we manage it locally
            unset($input['featured']);
        }

        $result = wc_request($base . '/wp-json/wc/v3/products/' . $productId, 'PUT', $input);
        break;
    case 'DELETE':
        if (!$productId) { http_response_code(400); echo json_encode(['error' => 'Missing product id']); exit; }
        $result = wc_request($base . '/wp-json/wc/v3/products/' . $productId . '?force=true', 'DELETE');
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
}

// ── Inject local featured flag into admin GET list ────────
if ($method === 'GET' && !$productId && ($result['code'] ?? 200) === 200) {
    $featuredFile = __DIR__ . '/featured.json';
    $featuredId   = 0;
    if (file_exists($featuredFile)) {
        $featuredData = json_decode(file_get_contents($featuredFile), true);
        $featuredId   = isset($featuredData['id']) ? (int)$featuredData['id'] : 0;
    }
    if ($featuredId > 0) {
        $items = json_decode($result['body'], true);
        if (is_array($items)) {
            foreach ($items as &$item) {
                $item['featured'] = ((int)$item['id'] === $featuredId);
            }
            unset($item);
            $result['body'] = json_encode($items);
        }
    }
}

http_response_code($result['code'] ?: 200);
echo $result['body'];
