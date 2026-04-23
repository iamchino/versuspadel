/**
 * /api/upload-image — Vercel Serverless Function
 *
 * Receives a base64-encoded image from the frontend and uploads it to the
 * WordPress Media Library using WP REST API + Application Passwords.
 *
 * POST { filename: string, data: string (base64), mimeType: string }
 * → 200 { id: number, src: string }
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!validateToken(req)) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const baseUrl = (process.env.WC_URL || '').replace(/\/$/, '');
  const wpUser = process.env.WP_USERNAME;
  const wpPass = process.env.WP_APP_PASSWORD;

  if (!baseUrl || !wpUser || !wpPass) {
    return res.status(500).json({ error: 'WordPress credentials not configured' });
  }

  const { filename, data, mimeType } = req.body || {};
  if (!filename || !data || !mimeType) {
    return res.status(400).json({ error: 'Missing filename, data, or mimeType' });
  }

  try {
    const imageBuffer = Buffer.from(data, 'base64');
    const wpAuth = 'Basic ' + Buffer.from(`${wpUser}:${wpPass}`).toString('base64');

    const wpResponse = await fetch(`${baseUrl}/wp-json/wp/v2/media`, {
      method: 'POST',
      headers: {
        'Authorization': wpAuth,
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
      body: imageBuffer,
    });

    const result = await wpResponse.json();

    if (!wpResponse.ok) {
      return res.status(wpResponse.status).json(result);
    }

    return res.status(200).json({
      id: result.id,
      src: result.source_url,
    });
  } catch (error: any) {
    console.error('Image upload error:', error);
    return res.status(502).json({
      error: 'Error uploading image',
      details: error.message,
    });
  }
}
