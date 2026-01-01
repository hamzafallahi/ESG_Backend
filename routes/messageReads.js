const express = require('express');
const router = express.Router();
const messageReadController = require('../controllers/MessageRead.controller');
const { create, update, getAll, delete: deleteValidation } = require('../validation/MessageRead.rules.js');
const MessageReadDeserializer = require('../deserializer/MessageReadDeserializer.js');
const deserializeMiddleware = require('../middleware/deserializeMiddleware');
const validate = require('../middleware/validationMiddleware');
const { requireAdmin } = require('../middleware/authMiddleware');

// All message read routes require admin or super admin role
router.use(requireAdmin);

router.get('/', validate(getAll), messageReadController.getAllMessageReads);

router.get('/:readId', messageReadController.getMessageReadById);

router.post('/', validate(create), deserializeMiddleware(MessageReadDeserializer), messageReadController.createMessageRead);

router.patch('/:readId', validate(update), deserializeMiddleware(MessageReadDeserializer), messageReadController.updateMessageRead);

router.delete('/:readId', validate(deleteValidation), messageReadController.deleteMessageRead);

module.exports = router;
