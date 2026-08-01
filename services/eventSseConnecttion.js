// events.js
const { v4: uuidv4 } = require('uuid');

const KEEP_ALIVE_INTERVAL_MS = 25000;
const DEFAULT_ALLOWED_ORIGINS = ['http://localhost:5173', 'http://localhost:5174','https://admin.esg-taa.tn','https://esg-taa.tn'];

const parseAllowedOrigins = () => {
  const raw = process.env.SSE_ALLOWED_ORIGINS || process.env.CORS_ALLOWED_ORIGINS;
  if (!raw) return DEFAULT_ALLOWED_ORIGINS;
  const parsed = raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  return parsed.length > 0 ? parsed : DEFAULT_ALLOWED_ORIGINS;
};

const ALLOWED_ORIGINS = parseAllowedOrigins();

const resolveAllowedOrigin = (origin) => {
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return origin;
  }
  return ALLOWED_ORIGINS[0];
};

/**
 * SSE connection handler for regular users
 */
exports.Event = (req, res) => {
  const userId = req.userId;
  if (!userId) {
    res.writeHead(401, { 'Content-Type': 'text/plain' });
    res.end('Unauthorized');
    return;
  }

  const origin = resolveAllowedOrigin(req.headers.origin);
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Vary': 'Origin'
  });

  if (typeof res.flushHeaders === 'function') res.flushHeaders();

  if (!global.clients) global.clients = new Map();
  const clientId = uuidv4();
  const client = {
    id: clientId,
    res,
    createdAt: Date.now(),
    userAgent: req.headers['user-agent'] || null,
    ip: req.ip || req.connection?.remoteAddress || null
  };

  const set = global.clients.get(userId) || new Set();
  set.add(client);
  global.clients.set(userId, set);

  const initialPayload = { type: 'connected', message: 'SSE connected', clientId };
  res.write(`event: connected\ndata: ${JSON.stringify(initialPayload)}\n\n`);
  if (typeof res.flush === 'function') res.flush();

  const keepAliveTimer = setInterval(() => {
    if (res.writableEnded) return;
    try {
      res.write(`: ping ${new Date().toISOString()}\n\n`);
      if (typeof res.flush === 'function') res.flush();
    } catch (error) {
      // Swallow write errors; disconnect handler will tidy up.
    }
  }, KEEP_ALIVE_INTERVAL_MS);

  const cleanup = () => {
    clearInterval(keepAliveTimer);
    const clientsForUser = global.clients.get(userId);
    if (clientsForUser) {
      clientsForUser.delete(client);
      if (clientsForUser.size === 0) {
        global.clients.delete(userId);
      }
    }
    if (!res.writableEnded) {
      try {
        res.end();
      } catch (error) {
        // Ignore end errors during cleanup.
      }
    }
  };

  req.on('close', cleanup);
  req.on('error', cleanup);
};

/**
 * SSE connection handler for admins and super admins
 */
exports.AdminEvent = (req, res) => {
  const adminId = req.userId;
  const role = req.userRole; // 'admin' or 'super_admin'
  
  if (!adminId || (role !== 'admin' && role !== 'super_admin')) {
    res.writeHead(401, { 'Content-Type': 'text/plain' });
    res.end('Unauthorized - Admin access required');
    return;
  }

  const origin = resolveAllowedOrigin(req.headers.origin);
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Vary': 'Origin'
  });

  if (typeof res.flushHeaders === 'function') res.flushHeaders();

  if (!global.adminClients) global.adminClients = new Map();
  const clientId = uuidv4();
  const client = {
    id: clientId,
    res,
    role,
    createdAt: Date.now(),
    userAgent: req.headers['user-agent'] || null,
    ip: req.ip || req.connection?.remoteAddress || null
  };

  const set = global.adminClients.get(adminId) || new Set();
  set.add(client);
  global.adminClients.set(adminId, set);

  const initialPayload = { type: 'connected', message: 'Admin SSE connected', clientId, role };
  res.write(`event: connected\ndata: ${JSON.stringify(initialPayload)}\n\n`);
  if (typeof res.flush === 'function') res.flush();

  const keepAliveTimer = setInterval(() => {
    if (res.writableEnded) return;
    try {
      res.write(`: ping ${new Date().toISOString()}\n\n`);
      if (typeof res.flush === 'function') res.flush();
    } catch (error) {
      // Swallow write errors; disconnect handler will tidy up.
    }
  }, KEEP_ALIVE_INTERVAL_MS);

  const cleanup = () => {
    clearInterval(keepAliveTimer);
    const clientsForAdmin = global.adminClients.get(adminId);
    if (clientsForAdmin) {
      clientsForAdmin.delete(client);
      if (clientsForAdmin.size === 0) {
        global.adminClients.delete(adminId);
      }
    }
    if (!res.writableEnded) {
      try {
        res.end();
      } catch (error) {
        // Ignore end errors during cleanup.
      }
    }
  };

  req.on('close', cleanup);
  req.on('error', cleanup);
};
