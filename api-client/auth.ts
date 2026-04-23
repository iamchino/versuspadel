/**
 * /api/auth — Vercel Serverless Function
 *
 * Validates the admin password sent from the frontend.
 * The real password is stored in the ADMIN_PASSWORD env var (Vercel Dashboard).
 * Returns a simple session token (base64-encoded timestamp) on success.
 *
 * POST { password: string }
 * → 200 { token: string }
 * → 401 { error: string }
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { password } = req.body || {};
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return res.status(500).json({ error: 'ADMIN_PASSWORD not configured on server' });
  }

  if (password !== adminPassword) {
    return res.status(401).json({ error: 'Contraseña incorrecta' });
  }

  // Simple token: base64 of password + timestamp — enough for a private admin tool
  const token = Buffer.from(`${adminPassword}:${Date.now()}`).toString('base64');
  return res.status(200).json({ token });
}
