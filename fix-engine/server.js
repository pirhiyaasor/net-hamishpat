// Fix Engine — zero-dependency local dev server.
// Serves the static site + a small JSON-backed REST/SSE API for the annotation workflow.
// Start with: node fix-engine/server.js
// Remove entirely: delete this whole fix-engine/ folder (see fix-engine/CLAUDE.md).

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = 3737;
const ROOT = path.join(__dirname, '..');
const CONFIG_PATH = path.join(__dirname, 'config.json');
const QUEUE_PATH = path.join(__dirname, 'data', 'queue.json');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

const STATUSES = ['entered', 'in_progress', 'done'];

function readConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch (e) {
    return { enabled: false };
  }
}

function loadQueue() {
  try {
    return JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'));
  } catch (e) {
    return [];
  }
}

function saveQueue(arr) {
  fs.mkdirSync(path.dirname(QUEUE_PATH), { recursive: true });
  fs.writeFileSync(QUEUE_PATH, JSON.stringify(arr, null, 2));
}

function sendJSON(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let chunks = '';
    req.on('data', (c) => { chunks += c; });
    req.on('end', () => {
      if (!chunks) return resolve({});
      try { resolve(JSON.parse(chunks)); }
      catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

// ---- SSE ----
const sseClients = [];

function broadcast(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data || {})}\n\n`;
  for (const res of sseClients) {
    try { res.write(payload); } catch (e) { /* client gone, cleaned up on close */ }
  }
}

function broadcastReload() { broadcast('reload', {}); }
function broadcastCardsUpdated() { broadcast('cards-updated', {}); }

// ---- static file serving ----
function serveStatic(req, res) {
  let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (pathname === '/') pathname = '/index.html';
  const filePath = path.normalize(path.join(ROOT, pathname));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

// ---- API ----
function findCard(queue, id) {
  return queue.find((c) => c.id === id);
}

async function handleApi(req, res, pathname) {
  const cfg = readConfig();
  if (!cfg.enabled) return sendJSON(res, 404, { error: 'fix-engine disabled' });

  if (req.method === 'GET' && pathname === '/api/health') {
    return sendJSON(res, 200, { ok: true, enabled: true });
  }

  if (req.method === 'GET' && pathname === '/api/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    });
    res.write('\n');
    sseClients.push(res);
    req.on('close', () => {
      const idx = sseClients.indexOf(res);
      if (idx !== -1) sseClients.splice(idx, 1);
    });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/cards') {
    const url = new URL(req.url, 'http://localhost');
    const statusFilter = url.searchParams.get('status');
    const queue = loadQueue();
    const result = statusFilter ? queue.filter((c) => c.status === statusFilter) : queue;
    return sendJSON(res, 200, result);
  }

  if (req.method === 'POST' && pathname === '/api/cards') {
    let body;
    try { body = await readBody(req); } catch (e) { return sendJSON(res, 400, { error: 'invalid JSON' }); }
    if (!body.note || typeof body.note !== 'string' || !body.note.trim()) {
      return sendJSON(res, 400, { error: 'note is required' });
    }
    const now = new Date().toISOString();
    const card = {
      id: crypto.randomUUID(),
      status: 'entered',
      note: body.note,
      context: body.context || {},
      flagged: false,
      flagReason: null,
      resolution: null,
      createdAt: now,
      updatedAt: now
    };
    const queue = loadQueue();
    queue.push(card);
    saveQueue(queue);
    broadcastCardsUpdated();
    return sendJSON(res, 201, card);
  }

  // /api/cards/:id/<action>
  const match = pathname.match(/^\/api\/cards\/([^/]+)\/(status|flag|unflag|resolution|complete)$/);
  if (match) {
    const [, id, action] = match;
    const queue = loadQueue();
    const card = findCard(queue, id);
    if (!card) return sendJSON(res, 404, { error: 'card not found' });

    let body = {};
    if (req.method === 'PATCH' || req.method === 'POST') {
      try { body = await readBody(req); } catch (e) { return sendJSON(res, 400, { error: 'invalid JSON' }); }
    }

    if (action === 'status' && req.method === 'PATCH') {
      const target = body.status;
      if (target === 'done') {
        return sendJSON(res, 400, { error: 'use POST /api/cards/:id/complete to mark a card done' });
      }
      if (!STATUSES.includes(target)) {
        return sendJSON(res, 400, { error: 'invalid status' });
      }
      card.status = target;
      card.updatedAt = new Date().toISOString();
      saveQueue(queue);
      broadcastCardsUpdated();
      return sendJSON(res, 200, card);
    }

    if (action === 'flag' && req.method === 'PATCH') {
      if (!body.flagReason || typeof body.flagReason !== 'string' || !body.flagReason.trim()) {
        return sendJSON(res, 400, { error: 'flagReason is required' });
      }
      card.flagged = true;
      card.flagReason = body.flagReason;
      card.updatedAt = new Date().toISOString();
      saveQueue(queue);
      broadcastCardsUpdated();
      return sendJSON(res, 200, card);
    }

    if (action === 'unflag' && req.method === 'PATCH') {
      card.flagged = false;
      card.flagReason = null;
      card.updatedAt = new Date().toISOString();
      saveQueue(queue);
      broadcastCardsUpdated();
      return sendJSON(res, 200, card);
    }

    if (action === 'resolution' && req.method === 'PATCH') {
      if (typeof body.resolution !== 'string') {
        return sendJSON(res, 400, { error: 'resolution is required' });
      }
      card.resolution = body.resolution;
      card.updatedAt = new Date().toISOString();
      saveQueue(queue);
      broadcastCardsUpdated();
      return sendJSON(res, 200, card);
    }

    if (action === 'complete' && req.method === 'POST') {
      if (req.headers['x-board-client'] !== 'true') {
        return sendJSON(res, 403, { error: 'this transition is board-only' });
      }
      card.status = 'done';
      card.updatedAt = new Date().toISOString();
      saveQueue(queue);
      broadcastCardsUpdated();
      return sendJSON(res, 200, card);
    }

    return sendJSON(res, 405, { error: 'method not allowed for this action' });
  }

  if (req.method === 'POST' && pathname === '/api/broadcast-reload') {
    broadcastReload();
    return sendJSON(res, 200, { ok: true });
  }

  return sendJSON(res, 404, { error: 'not found' });
}

const server = http.createServer((req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');
  if (pathname.startsWith('/api/')) {
    handleApi(req, res, pathname).catch((e) => sendJSON(res, 500, { error: String(e) }));
  } else {
    serveStatic(req, res);
  }
});

server.listen(PORT, () => {
  console.log(`fix-engine listening on http://localhost:${PORT}`);
});
