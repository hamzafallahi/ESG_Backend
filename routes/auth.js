const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authController = require('../controllers/Auth.controller');
const { createRules, loginRules } = require('../validation/Auth.rules.js');
const AuthDeserializer = require('../deserializer/authdeserializer.js');
const deserializeMiddleware = require('../middleware/deserializeMiddleware');
const validate = require('../middleware/validationMiddleware');

// Auth routes
router.post('/signup', validate(createRules), deserializeMiddleware(AuthDeserializer), authController.signup);
router.post('/login', validate(loginRules), deserializeMiddleware(AuthDeserializer), authController.login);

// Protected route - get current user info
// We'll need to create a middleware to verify JWT token
router.get('/me', authMiddleware, authController.getCurrentUser);

// JWT verification middleware
function authMiddleware(req, res, next) {
  // Get the token from the header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      errors: [{
        status: '401',
        title: 'Unauthorized',
        detail: 'No token provided'
      }]
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, require('../config/app-config').JWT_SECRET);
    
    // Add user id to request
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ 
      errors: [{
        status: '401',
        title: 'Unauthorized',
        detail: 'Invalid token'
      }]
    });
  }
}

module.exports = router;