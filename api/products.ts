/**
 * /api/products — Vercel Serverless Function
 *
 * Secure proxy to WooCommerce REST API v3 for product CRUD.
 * Credentials (WC_CONSUMER_KEY / SECRET) stay on the server.
 *
 * GET    → List all products
 * POST   → Create a new product
 * PUT    → Update a product (requires ?id=<product_id>)
 * DELETE → Delete a product (requires ?id=<product_id>)
 *
 * All requests require Authorization: Bearer <token> header.
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

function getWcAuth(): string {
  const key = process.env.WC_CONSUMER_KEY;
  const secret = process.env.WC_CONSUMER_SECRET;
  return 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64');
}

function getBaseUrl(): string {
  return (process.env.WC_URL || '').replace(/\/$/, '');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!validateToken(req)) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    return res.status(500).json({ error: 'WC_URL not configured' });
  }

  const productId = req.query.id as string | undefined;

  try {
    let wcUrl: string;
    let wcMethod: string = req.method || 'GET';
    let wcBody: string | undefined;

    switch (req.method) {
      case 'GET':
        wcUrl = `${baseUrl}/wp-json/wc/v3/products?per_page=100`;
        break;
      case 'POST':
        wcUrl = `${baseUrl}/wp-json/wc/v3/products`;
        wcBody = JSON.stringify(req.body);
        break;
      case 'PUT':
        if (!productId) return res.status(400).json({ error: 'Missing product id' });
        wcUrl = `${baseUrl}/wp-json/wc/v3/products/${productId}`;
        wcBody = JSON.stringify(req.body);
        break;
      case 'DELETE':
        if (!productId) return res.status(400).json({ error: 'Missing product id' });
        wcUrl = `${baseUrl}/wp-json/wc/v3/products/${productId}?force=true`;
        break;
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const wcResponse = await fetch(wcUrl, {
      method: wcMethod,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getWcAuth(),
      },
      ...(wcBody ? { body: wcBody } : {}),
    });

    const data = await wcResponse.json();

    if (!wcResponse.ok) {
      return res.status(wcResponse.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error('WooCommerce API error:', error);
    return res.status(502).json({
      error: 'Error connecting to WooCommerce',
      details: error.message,
    });
  }
}
