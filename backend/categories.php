<?php
/**
 * categories.php — WooCommerce categories proxy
 *
 * GET → List all product categories
 * Requires: Authorization: Bearer <token>
 */

require_once __DIR__ . '/middleware.php';

// ── Setup ────────────────────────────────────────────────
cors_headers('GET, OPTIONS');
handle_preflight();
require_method('GET');
require_auth();

// ── Call WooCommerce ──────────────────────────────────────
$result = wc_request(
    wc_base_url() . '/wp-json/wc/v3/products/categories?per_page=100&hide_empty=false',
    'GET'
);

http_response_code($result['code'] ?: 200);
echo $result['body'];
