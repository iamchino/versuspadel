<?php
/**
 * analytics.php — WooCommerce analytics proxy
 *
 * GET /backend/analytics.php
 *
 * Returns:
 * - Monthly revenue & order count
 * - Orders by status
 * - Recent orders (last 5)
 * - Top selling products this month
 *
 * Requires: Authorization: Bearer <token>
 */

require_once __DIR__ . '/middleware.php';
require_once __DIR__ . '/analytics-store.php';

// ── Setup ────────────────────────────────────────────────
cors_headers('GET, OPTIONS');
handle_preflight();
require_method('GET');
require_auth();

// ── Date helpers ──────────────────────────────────────────
$monthStart    = date('Y-m-01') . 'T00:00:00';
$todayEnd      = date('Y-m-d') . 'T23:59:59';
$prevMonthStart = date('Y-m-01', strtotime('-1 month')) . 'T00:00:00';
$prevMonthEnd   = date('Y-m-t', strtotime('-1 month')) . 'T23:59:59';

// ── Fetch data ────────────────────────────────────────────

// All orders this month (any status, up to 100)
$monthOrders = wc_get('/wp-json/wc/v3/orders?per_page=100&after=' . urlencode($monthStart) . '&before=' . urlencode($todayEnd) . '&status=any&orderby=date&order=desc');

// All orders last month
$prevMonthOrders = wc_get('/wp-json/wc/v3/orders?per_page=100&after=' . urlencode($prevMonthStart) . '&before=' . urlencode($prevMonthEnd) . '&status=any');

// Recent 5 orders for the table
$recentOrders = wc_get('/wp-json/wc/v3/orders?per_page=5&orderby=date&order=desc&status=any');

// Top sellers (WooCommerce reports)
$topSellers = wc_get('/wp-json/wc/v3/reports/top_sellers?period=month');
$siteAnalytics = analytics_summarize_events(30);

// ── Process metrics ───────────────────────────────────────

$statusLabels = ['pending' => 'Pendiente', 'processing' => 'Procesando', 'completed' => 'Completado', 'cancelled' => 'Cancelado', 'on-hold' => 'En espera'];

function calcMetrics(array $orders): array {
    $revenue = 0.0;
    $byStatus = ['pending' => 0, 'processing' => 0, 'completed' => 0, 'cancelled' => 0, 'on-hold' => 0];
    foreach ($orders as $o) {
        $st = $o['status'] ?? '';
        if (in_array($st, ['completed', 'processing'])) {
            $revenue += (float)($o['total'] ?? 0);
        }
        if (array_key_exists($st, $byStatus)) $byStatus[$st]++;
    }
    return ['revenue' => $revenue, 'count' => count($orders), 'by_status' => $byStatus];
}

$thisMonth = calcMetrics($monthOrders);
$lastMonth = calcMetrics($prevMonthOrders);

// Revenue growth %
$revenueGrowth = $lastMonth['revenue'] > 0
    ? round(($thisMonth['revenue'] - $lastMonth['revenue']) / $lastMonth['revenue'] * 100, 1)
    : ($thisMonth['revenue'] > 0 ? 100 : 0);

// Format recent orders for UI
$formattedRecent = array_map(function($o) {
    return [
        'id'       => $o['id'],
        'status'   => $o['status'],
        'total'    => $o['total'],
        'currency' => $o['currency'] ?? 'ARS',
        'date'     => substr($o['date_created'] ?? '', 0, 10),
        'customer' => trim(($o['billing']['first_name'] ?? '') . ' ' . ($o['billing']['last_name'] ?? '')),
        'items'    => array_map(fn($li) => $li['name'] ?? '', $o['line_items'] ?? []),
    ];
}, $recentOrders);

// ── Response ──────────────────────────────────────────────
echo json_encode([
    'this_month' => [
        'revenue'   => $thisMonth['revenue'],
        'orders'    => $thisMonth['count'],
        'by_status' => $thisMonth['by_status'],
    ],
    'last_month' => [
        'revenue' => $lastMonth['revenue'],
        'orders'  => $lastMonth['count'],
    ],
    'revenue_growth' => $revenueGrowth,
    'pending_count'  => $thisMonth['by_status']['pending'] + $thisMonth['by_status']['processing'],
    'recent_orders'  => $formattedRecent,
    'top_sellers'    => array_slice($topSellers, 0, 5),
    'site'           => $siteAnalytics,
    'generated_at'   => date('c'),
], JSON_UNESCAPED_UNICODE);
