const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/Settings.controller');
const { create, update, getAll, delete: deleteValidation } = require('../validation/Settings.rules.js');
const SettingsDeserializer = require('../deserializer/settingsdeserializer.js');
const deserializeMiddleware = require('../middleware/deserializeMiddleware');
const validate = require('../middleware/validationMiddleware');
const { requireAdmin } = require('../middleware/authMiddleware');

// Public reads (authentication already handled in index.js)
router.get('/', validate(getAll), settingsController.getAllSettings);

router.get('/:settingId', settingsController.getSettingById);

// Get setting by key
router.get('/key/:key', settingsController.getSettingByKey);

// Protected routes - only admins and super admins can create/update/delete
router.post('/', requireAdmin, validate(create), deserializeMiddleware(SettingsDeserializer), settingsController.createSetting);

router.patch('/:settingId', requireAdmin, validate(update), deserializeMiddleware(SettingsDeserializer), settingsController.updateSetting);

// Update setting by key
router.patch('/key/:key', requireAdmin, validate(update), deserializeMiddleware(SettingsDeserializer), settingsController.updateSettingByKey);

router.delete('/:settingId', requireAdmin, validate(deleteValidation), settingsController.deleteSetting);

module.exports = router;
