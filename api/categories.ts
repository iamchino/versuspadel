/**
 * /api/categories — Vercel Serverless Function
 *
 * Fetches product categories from WooCommerce REST API v3.
 * Used to populate the category dropdown in the admin product form.
 *
 * GET → List all categories
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

function validateToken(req: VercelRequest): boolean {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return false;
  const token = auth.split(' ')[1];
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [password, timestamp] = decoded.split(':');
    
    if (password !== process.env.ADMIN_PASSWORD) return false;
    
    // Check if token is older than 24 hours (24 * 60 * 60 * 1000 ms)
    if (timestamp) {
      const timeAge = Date.now() - parseInt(timestamp, 10);
      if (timeAge > 86400000) return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  if (!validateToken(req)) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const baseUrl = (process.env.WC_URL || '').replace(/\/$/, '');
  if (!baseUrl) {
    return res.status(500).json({ error: 'WC_URL not configured' });
  }

  const key = process.env.WC_CONSUMER_KEY;
  const secret = process.env.WC_CONSUMER_SECRET;
  const auth = 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64');

  try {
    const wcResponse = await fetch(
      `${baseUrl}/wp-json/wc/v3/products/categories?per_page=100`,
      {
        headers: {
          'Authorization': auth,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await wcResponse.json();
    if (!wcResponse.ok) return res.status(wcResponse.status).json(data);

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('WooCommerce categories error:', error);
    return res.status(502).json({
      error: 'Error fetching categories',
      details: error.message,
    });
  }
}
