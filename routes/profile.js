const express = require('express');
const router = express.Router();
const userController = require('../controllers/User.controller');
const { selfUpdate, getOwnProfile } = require('../validation/User.rules.js');
const UserDeserializer = require('../deserializer/userdeserializer.js');
const deserializeMiddleware = require('../middleware/deserializeMiddleware');
const validate = require('../middleware/validationMiddleware');

// Get current user's own profile
router.get('/', validate(getOwnProfile), userController.getOwnProfile);

// Update current user's own profile (user can only update their own info)
router.patch('/', validate(selfUpdate), deserializeMiddleware(UserDeserializer), userController.updateOwnProfile);

module.exports = router;
