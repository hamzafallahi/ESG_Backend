const express = require('express');
const router = express.Router();
const inboxActionsController = require('../controllers/InboxActions.controller');
const { retakeRequest, contactUs, bugReport, supportRequest, retakeResponse } = require('../validation/InboxActions.rules.js');
const validate = require('../middleware/validationMiddleware');
const { authenticate, requireAdmin, optionalAuthenticate } = require('../middleware/authMiddleware');

// ============================================
// USER ENDPOINTS (Authenticated users)
// ============================================

// User requests an assessment retake
// POST /inbox-actions/retake-request
router.post('/retake-request', authenticate, validate(retakeRequest), inboxActionsController.requestRetake);

// User submits a bug report
// POST /inbox-actions/bug-report
router.post('/bug-report', authenticate, validate(bugReport), inboxActionsController.submitBugReport);

// User submits a support request
// POST /inbox-actions/support-request
router.post('/support-request', authenticate, validate(supportRequest), inboxActionsController.submitSupportRequest);

// ============================================
// PUBLIC ENDPOINTS (Optional authentication)
// ============================================

// Anyone submits a contact us message (visitor or authenticated user)
// POST /inbox-actions/contact-us
router.post('/contact-us', optionalAuthenticate, validate(contactUs), inboxActionsController.submitContactUs);

// ============================================
// ADMIN ENDPOINTS (Admin/SuperAdmin only)
// ============================================

// Admin approves a retake request
// POST /inbox-actions/retake-request/:messageId/approve
router.post('/retake-request/:messageId/approve', authenticate, requireAdmin, validate(retakeResponse), inboxActionsController.approveRetakeRequest);

// Admin disapproves a retake request
// POST /inbox-actions/retake-request/:messageId/disapprove
router.post('/retake-request/:messageId/disapprove', authenticate, requireAdmin, validate(retakeResponse), inboxActionsController.disapproveRetakeRequest);

module.exports = router;
