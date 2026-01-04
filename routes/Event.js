const express = require('express');
const router = express.Router();
const { Event, AdminEvent } = require('../services/eventSseConnecttion');
const { authenticateSSE, requireAdmin } = require('../middleware/authMiddleware');

// SSE endpoint for regular users
router.get('/', authenticateSSE, Event);

// SSE endpoint for admins and super admins
router.get('/admin', authenticateSSE, requireAdmin, AdminEvent);

module.exports = router;