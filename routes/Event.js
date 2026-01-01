const express = require('express');
const router = express.Router();
const { Event, AdminEvent } = require('../services/eventSseConnecttion');
const { requireAdmin } = require('../middleware/authMiddleware');

// SSE endpoint for regular users
router.get('/', Event);

// SSE endpoint for admins and super admins
router.get('/admin', requireAdmin, AdminEvent);

module.exports = router;