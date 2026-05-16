<?php
/**
 * auth.php — Admin login endpoint
 *
 * POST { password: string }
 * → 200 { token: string }
 * → 401 { error: string }
 */

require_once __DIR__ . '/middleware.php';

// ── Setup ────────────────────────────────────────────────
cors_headers('POST, OPTIONS');
handle_preflight();
require_method('POST');

if (!defined('ADMIN_PASSWORD') || ADMIN_PASSWORD === '' || ADMIN_PASSWORD === 'your_admin_password_here') {
    http_response_code(500);
    echo json_encode(['error' => 'ADMIN_PASSWORD not configured on server']);
    exit;
}

$input    = json_decode(file_get_contents('php://input'), true);
$password = trim($input['password'] ?? '');

if (!$password || !hash_equals(ADMIN_PASSWORD, $password)) {
    // Rate-limit hint (not real throttle, but discourages brute force)
    sleep(1);
    http_response_code(401);
    echo json_encode(['error' => 'Contraseña incorrecta']);
    exit;
}

// Token: HMAC-SHA256 of (password + timestamp) — not guessable
$timestamp = time();
$signature = hash_hmac('sha256', ADMIN_PASSWORD . ':' . $timestamp, ADMIN_PASSWORD);
$token     = base64_encode($signature . ':' . $timestamp);

echo json_encode(['token' => $token]);
