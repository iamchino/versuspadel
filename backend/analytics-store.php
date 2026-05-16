<?php
/**
 * Shared file-backed analytics storage.
 *
 * The public tracker writes JSON lines here, and the admin analytics endpoint
 * reads the same file to build dashboard metrics.
 */

if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === basename(__FILE__)) {
    http_response_code(404);
    exit;
}

function analytics_data_dir(): string {
    return __DIR__ . '/data';
}

function analytics_events_file(): string {
    return analytics_data_dir() . '/analytics-events.jsonl';
}

function analytics_bootstrap_storage(): bool {
    $dir = analytics_data_dir();

    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        return false;
    }

    $htaccess = $dir . '/.htaccess';
    if (!file_exists($htaccess)) {
        @file_put_contents($htaccess, "Require all denied\n");
    }

    $index = $dir . '/index.html';
    if (!file_exists($index)) {
        @file_put_contents($index, '');
    }

    return is_writable($dir);
}

function analytics_allowed_events(): array {
    return [
        'page_view',
        'product_view',
        'add_to_cart',
        'cart_view',
        'checkout_start',
        'purchase',
        'lead',
    ];
}

function analytics_clean_string(mixed $value, int $max = 500): string {
    $value = is_scalar($value) ? (string) $value : '';
    $value = trim(strip_tags($value));
    $value = preg_replace('/[\x00-\x1F\x7F]/', ' ', $value) ?? '';
    return substr($value, 0, $max);
}

function analytics_clean_key(mixed $value): string {
    $key = strtolower(analytics_clean_string($value, 80));
    $key = preg_replace('/[^a-z0-9_\-]/', '_', $key) ?? '';
    return trim($key, '_');
}

function analytics_clean_value(mixed $value, int $depth = 0): mixed {
    if ($depth > 3) return null;
    if ($value === null || is_bool($value) || is_int($value) || is_float($value)) return $value;
    if (is_string($value)) return analytics_clean_string($value, 500);

    if (is_array($value)) {
        $clean = [];
        $count = 0;

        foreach ($value as $key => $item) {
            if ($count >= 30) break;

            if (is_int($key)) {
                $clean[] = analytics_clean_value($item, $depth + 1);
            } else {
                $cleanKey = analytics_clean_key($key);
                if ($cleanKey !== '') {
                    $clean[$cleanKey] = analytics_clean_value($item, $depth + 1);
                }
            }

            $count++;
        }

        return $clean;
    }

    return null;
}

function analytics_clean_properties(mixed $properties): array {
    $clean = analytics_clean_value(is_array($properties) ? $properties : []);
    return is_array($clean) ? $clean : [];
}

function analytics_client_ip(): string {
    $headers = [
        $_SERVER['HTTP_CF_CONNECTING_IP'] ?? '',
        $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '',
        $_SERVER['REMOTE_ADDR'] ?? '',
    ];

    foreach ($headers as $header) {
        $ip = trim(explode(',', $header)[0] ?? '');
        if (filter_var($ip, FILTER_VALIDATE_IP)) return $ip;
    }

    return '0.0.0.0';
}

function analytics_ip_hash(): string {
    $salt = defined('ADMIN_PASSWORD') ? ADMIN_PASSWORD : 'versus-analytics';
    return hash_hmac('sha256', analytics_client_ip(), $salt);
}

function analytics_referrer_host(string $referrer): string {
    if ($referrer === '') return '';
    $host = parse_url($referrer, PHP_URL_HOST);
    return is_string($host) ? analytics_clean_string($host, 120) : '';
}

function analytics_build_event(array $input): array {
    $event = analytics_clean_key($input['event'] ?? '');
    if (!in_array($event, analytics_allowed_events(), true)) {
        throw new InvalidArgumentException('Evento no permitido');
    }

    $referrer = analytics_clean_string($input['referrer'] ?? '', 500);

    return [
        'event' => $event,
        'event_id' => analytics_clean_string($input['event_id'] ?? '', 140),
        'visitor_id' => analytics_clean_string($input['visitor_id'] ?? '', 140),
        'session_id' => analytics_clean_string($input['session_id'] ?? '', 140),
        'path' => analytics_clean_string($input['path'] ?? '/', 500),
        'title' => analytics_clean_string($input['title'] ?? '', 220),
        'referrer' => $referrer,
        'referrer_host' => analytics_referrer_host($referrer),
        'properties' => analytics_clean_properties($input['properties'] ?? []),
        'client_ts' => analytics_clean_string($input['client_ts'] ?? '', 80),
        'created_at' => date('c'),
        'ip_hash' => analytics_ip_hash(),
        'user_agent' => analytics_clean_string($_SERVER['HTTP_USER_AGENT'] ?? '', 255),
    ];
}

function analytics_append_event(array $event): bool {
    if (!analytics_bootstrap_storage()) return false;

    $line = json_encode($event, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($line === false) return false;

    return file_put_contents(analytics_events_file(), $line . PHP_EOL, FILE_APPEND | LOCK_EX) !== false;
}

function analytics_recent_events(int $days = 30): array {
    $file = analytics_events_file();
    if (!file_exists($file)) return [];

    $cutoff = time() - max(1, $days) * 86400;
    $events = [];
    $handle = fopen($file, 'rb');
    if (!$handle) return [];

    while (($line = fgets($handle)) !== false) {
        $event = json_decode($line, true);
        if (!is_array($event)) continue;

        $createdAt = strtotime($event['created_at'] ?? '') ?: 0;
        if ($createdAt >= $cutoff) {
            $events[] = $event;
        }
    }

    fclose($handle);
    return $events;
}

function analytics_counter_to_rows(array $counter, int $limit, callable $map): array {
    arsort($counter);
    $rows = [];

    foreach (array_slice($counter, 0, $limit, true) as $key => $count) {
        $rows[] = $map($key, $count);
    }

    return $rows;
}

function analytics_summarize_events(int $days = 30): array {
    $events = analytics_recent_events($days);
    $today = date('Y-m-d');

    $pageViews = 0;
    $todayPageViews = 0;
    $productViews = 0;
    $addToCart = 0;
    $cartViews = 0;
    $checkoutStarts = 0;
    $leads = 0;
    $visitors = [];
    $todayVisitors = [];
    $sessions = [];
    $pages = [];
    $referrers = [];
    $products = [];
    $daily = [];
    $lastEvents = [];

    foreach ($events as $event) {
        $eventName = $event['event'] ?? '';
        $date = substr($event['created_at'] ?? '', 0, 10);
        $visitorId = $event['visitor_id'] ?? '';
        $sessionId = $event['session_id'] ?? '';
        $path = $event['path'] ?? '/';
        $props = is_array($event['properties'] ?? null) ? $event['properties'] : [];

        if ($visitorId !== '') $visitors[$visitorId] = true;
        if ($sessionId !== '') $sessions[$sessionId] = true;

        if (!isset($daily[$date])) {
            $daily[$date] = ['date' => $date, 'page_views' => 0, 'visitors' => []];
        }

        if ($eventName === 'page_view') {
            $pageViews++;
            $pages[$path] = ($pages[$path] ?? 0) + 1;
            $daily[$date]['page_views']++;

            if ($visitorId !== '') $daily[$date]['visitors'][$visitorId] = true;
            if ($date === $today) {
                $todayPageViews++;
                if ($visitorId !== '') $todayVisitors[$visitorId] = true;
            }

            $referrerHost = $event['referrer_host'] ?? '';
            if ($referrerHost !== '') {
                $referrers[$referrerHost] = ($referrers[$referrerHost] ?? 0) + 1;
            }
        }

        if ($eventName === 'product_view') $productViews++;
        if ($eventName === 'add_to_cart') $addToCart++;
        if ($eventName === 'cart_view') $cartViews++;
        if ($eventName === 'checkout_start') $checkoutStarts++;
        if ($eventName === 'lead') $leads++;

        if (in_array($eventName, ['product_view', 'add_to_cart', 'checkout_start'], true)) {
            $productId = (string) ($props['product_id'] ?? 'unknown');
            $productName = (string) ($props['product_name'] ?? 'Producto');

            if (!isset($products[$productId])) {
                $products[$productId] = [
                    'product_id' => $productId,
                    'name' => $productName,
                    'views' => 0,
                    'add_to_cart' => 0,
                    'checkout_starts' => 0,
                ];
            }

            if ($eventName === 'product_view') $products[$productId]['views']++;
            if ($eventName === 'add_to_cart') $products[$productId]['add_to_cart']++;
            if ($eventName === 'checkout_start') $products[$productId]['checkout_starts']++;
        }

        $lastEvents[] = [
            'event' => $eventName,
            'path' => $path,
            'product_name' => $props['product_name'] ?? '',
            'created_at' => $event['created_at'] ?? '',
        ];
    }

    usort($products, function ($a, $b) {
        return ($b['views'] + $b['add_to_cart'] * 3 + $b['checkout_starts'] * 5)
            <=> ($a['views'] + $a['add_to_cart'] * 3 + $a['checkout_starts'] * 5);
    });

    ksort($daily);
    $dailyRows = array_map(function ($row) {
        return [
            'date' => $row['date'],
            'page_views' => $row['page_views'],
            'visitors' => count($row['visitors']),
        ];
    }, array_values($daily));

    return [
        'period_days' => $days,
        'total_events' => count($events),
        'page_views' => $pageViews,
        'today_page_views' => $todayPageViews,
        'unique_visitors' => count($visitors),
        'today_visitors' => count($todayVisitors),
        'sessions' => count($sessions),
        'product_views' => $productViews,
        'add_to_cart' => $addToCart,
        'cart_views' => $cartViews,
        'checkout_starts' => $checkoutStarts,
        'leads' => $leads,
        'cart_rate' => $pageViews > 0 ? round($addToCart / $pageViews * 100, 1) : 0,
        'checkout_rate' => $addToCart > 0 ? round($checkoutStarts / $addToCart * 100, 1) : 0,
        'top_pages' => analytics_counter_to_rows($pages, 6, fn($path, $count) => ['path' => $path, 'views' => $count]),
        'top_referrers' => analytics_counter_to_rows($referrers, 5, fn($host, $count) => ['host' => $host, 'views' => $count]),
        'top_products' => array_slice($products, 0, 6),
        'daily' => array_slice($dailyRows, -14),
        'last_events' => array_slice(array_reverse($lastEvents), 0, 8),
    ];
}
