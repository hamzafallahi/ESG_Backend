const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authController = require('../controllers/Auth.controller');
const { createRules, loginRules } = require('../validation/Auth.rules.js');
const AuthDeserializer = require('../deserializer/authdeserializer.js');
const deserializeMiddleware = require('../middleware/deserializeMiddleware');
const validate = require('../middleware/validationMiddleware');
const { authenticate } = require('../middleware/authMiddleware');

// User Auth routes
router.post('/signup', validate(createRules), deserializeMiddleware(AuthDeserializer), authController.signup);
router.post('/login', validate(loginRules), deserializeMiddleware(AuthDeserializer), authController.login);
router.get('/me', authenticate, authController.getCurrentUser);

// Admin Auth routes
router.post('/admin/login', authController.adminLogin);
router.get('/admin/me', authenticate, authController.getCurrentAdmin);

module.exports = router;