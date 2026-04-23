<?php
/**
 * /api/auth.php — PHP Backend Endpoint
 *
 * Validates the admin password sent from the frontend.
 * Returns a simple session token (base64-encoded timestamp) on success.
 *
 * POST { password: string }
 * → 200 { token: string }
 * → 401 { error: string }
 */

require_once __DIR__ . '/config.php';

// ── CORS Headers ──────────────────────────────────────────
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// ── Read body ─────────────────────────────────────────────
$input = json_decode(file_get_contents('php://input'), true);
$password = $input['password'] ?? '';

if (!defined('ADMIN_PASSWORD') || ADMIN_PASSWORD === '') {
    http_response_code(500);
    echo json_encode(['error' => 'ADMIN_PASSWORD not configured on server']);
    exit;
}

if ($password !== ADMIN_PASSWORD) {
    http_response_code(401);
    echo json_encode(['error' => 'Contraseña incorrecta']);
    exit;
}

// ── Generate token: base64(password:timestamp) ────────────
$token = base64_encode(ADMIN_PASSWORD . ':' . time() * 1000);
echo json_encode(['token' => $token]);
