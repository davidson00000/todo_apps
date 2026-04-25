// api/state.js — Vercel serverless function
// GET  /api/state?key=...  → returns saved state JSON (or default)
// POST /api/state?key=...  → saves state JSON (body)
//
// Uses Vercel KV (Upstash Redis under the hood).
// Env vars (auto-set when you connect a KV store in Vercel dashboard):
//   KV_REST_API_URL
//   KV_REST_API_TOKEN
// You must also set:
//   APP_KEY  — secret token; clients must pass ?key=<APP_KEY> in URL

const STORE_KEY = 'todoapp:state:v1';

async function kvFetch(path, options = {}) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    throw new Error('KV not configured (missing KV_REST_API_URL / KV_REST_API_TOKEN)');
  }
  const res = await fetch(`${url}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`KV ${res.status}: ${text}`);
  }
  return res.json();
}

export default async function handler(req, res) {
  // CORS — allow same-origin always; permissive for safety
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Auth — simple URL token check
  const APP_KEY = process.env.APP_KEY;
  if (!APP_KEY) {
    return res.status(500).json({ error: 'APP_KEY not configured on server' });
  }
  const provided = (req.query && req.query.key) || '';
  if (provided !== APP_KEY) {
    return res.status(401).json({ error: 'invalid or missing key' });
  }

  try {
    if (req.method === 'GET') {
      // KV REST: GET /get/<key>
      const data = await kvFetch(`/get/${encodeURIComponent(STORE_KEY)}`);
      const raw = data && data.result;
      if (!raw) {
        return res.status(200).json({ state: null });
      }
      let parsed = null;
      try {
        parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      } catch (e) {
        parsed = null;
      }
      return res.status(200).json({ state: parsed });
    }

    if (req.method === 'POST') {
      // body may already be parsed by Vercel
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) { body = null; }
      }
      if (!body || typeof body !== 'object') {
        return res.status(400).json({ error: 'invalid body' });
      }
      const payload = JSON.stringify(body);
      // KV REST: POST /set/<key>  with body = value (raw string)
      await kvFetch(`/set/${encodeURIComponent(STORE_KEY)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: payload,
      });
      return res.status(200).json({ ok: true, savedAt: Date.now() });
    }

    return res.status(405).json({ error: 'method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: String(err.message || err) });
  }
}
