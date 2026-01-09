const express = require('express');
const router = express.Router();
const inboxMessageController = require('../controllers/InboxMessage.controller');
const { create, update, getAll, delete: deleteValidation, checkPendingRetake } = require('../validation/InboxMessage.rules.js');
const InboxMessageDeserializer = require('../deserializer/InboxMessageDeserializer.js');
const deserializeMiddleware = require('../middleware/deserializeMiddleware');
const validate = require('../middleware/validationMiddleware');
const { requireAdmin } = require('../middleware/authMiddleware');

// User endpoint - Check if user has pending retake request
router.get('/check-pending-retake', validate(checkPendingRetake), inboxMessageController.checkPendingRetakeRequest);

// All remaining inbox message routes require admin or super admin role
router.use(requireAdmin);

router.get('/', validate(getAll), inboxMessageController.getAllInboxMessages);

router.get('/user/:userId', validate(getAll), inboxMessageController.getAllInboxMessagesByUser);

router.get('/:messageId', inboxMessageController.getInboxMessageById);

router.post('/', validate(create), deserializeMiddleware(InboxMessageDeserializer), inboxMessageController.createInboxMessage);

router.patch('/:messageId', validate(update), deserializeMiddleware(InboxMessageDeserializer), inboxMessageController.updateInboxMessage);

router.delete('/:messageId', validate(deleteValidation), inboxMessageController.deleteInboxMessage);

module.exports = router;
