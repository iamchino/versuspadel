<?php
/**
 * Public analytics collector.
 *
 * POST /backend/track.php
 */

require_once __DIR__ . '/middleware.php';
require_once __DIR__ . '/analytics-store.php';

cors_headers('POST, OPTIONS', false);
handle_preflight();
require_method('POST');

$contentLength = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
if ($contentLength > 65536) {
    http_response_code(413);
    echo json_encode(['error' => 'Payload demasiado grande']);
    exit;
}

$raw = file_get_contents('php://input');
$input = json_decode($raw ?: '', true);

if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(['error' => 'JSON invalido']);
    exit;
}

try {
    $event = analytics_build_event($input);
} catch (InvalidArgumentException $error) {
    http_response_code(400);
    echo json_encode(['error' => $error->getMessage()]);
    exit;
}

if (!analytics_append_event($event)) {
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo guardar el evento']);
    exit;
}

http_response_code(202);
echo json_encode(['ok' => true]);
