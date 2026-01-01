const { safeWrite } = require('../helper/sseHelper.js');

/**
 * Send SSE event to a specific user by their ID
 */
function sendToUser(userId, payload) {
  const targetId = String(userId || '').trim();
  if (!targetId) return;

  if (!global.clients) global.clients = new Map();
  const set = global.clients.get(targetId);
  if (!set || set.size === 0) {
    return;
  }

  const message = `data: ${JSON.stringify(payload)}\n\n`;
  const toRemove = [];

  for (const client of set) {
    const res = client.res;
    if (!res || res.writableEnded) {
      toRemove.push(client);
      continue;
    }

    const wrote = safeWrite(res, message);
    if (!wrote) {
      toRemove.push(client);
      continue;
    }
  }

  if (toRemove.length) {
    for (const client of toRemove) {
      set.delete(client);
    }
    if (set.size === 0) {
      global.clients.delete(targetId);
    }
  }
}

/**
 * Send SSE event to all connected admins and super admins
 * Admin/SuperAdmin clients are identified by their role prefix in the client map
 */
function sendToAllAdmins(payload) {
  if (!global.adminClients) global.adminClients = new Map();
  
  const message = `data: ${JSON.stringify(payload)}\n\n`;
  const toRemove = [];

  for (const [adminId, set] of global.adminClients) {
    for (const client of set) {
      const res = client.res;
      if (!res || res.writableEnded) {
        toRemove.push({ adminId, client });
        continue;
      }

      const wrote = safeWrite(res, message);
      if (!wrote) {
        toRemove.push({ adminId, client });
        continue;
      }
    }
  }

  // Cleanup disconnected clients
  if (toRemove.length) {
    for (const { adminId, client } of toRemove) {
      const set = global.adminClients.get(adminId);
      if (set) {
        set.delete(client);
        if (set.size === 0) {
          global.adminClients.delete(adminId);
        }
      }
    }
  }
}

/**
 * Get count of connected admin clients
 */
function getConnectedAdminCount() {
  if (!global.adminClients) return 0;
  let count = 0;
  for (const set of global.adminClients.values()) {
    count += set.size;
  }
  return count;
}

/**
 * Get count of connected user clients
 */
function getConnectedUserCount() {
  if (!global.clients) return 0;
  let count = 0;
  for (const set of global.clients.values()) {
    count += set.size;
  }
  return count;
}

module.exports = { sendToUser, sendToAllAdmins, getConnectedAdminCount, getConnectedUserCount };
