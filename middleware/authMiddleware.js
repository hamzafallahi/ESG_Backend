const jwt = require('jsonwebtoken');
const config = require('../config/app-config');
const db = require('../models');

/**
 * Middleware to verify JWT token and attach user information to request
 */
const authenticate = async (req, res, next) => {
  try {
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

    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    // Add user info to request
    req.userId = decoded.id;
    req.userRole = decoded.role; // 'user', 'admin', or 'super_admin'
    
    next();
  } catch (error) {
    return res.status(401).json({ 
      errors: [{
        status: '401',
        title: 'Unauthorized',
        detail: 'Invalid or expired token'
      }]
    });
  }
};

/**
 * Middleware to check if user is an admin or super admin
 */
const requireAdmin = (req, res, next) => {
  if (!req.userRole || (req.userRole !== 'admin' && req.userRole !== 'super_admin')) {
    return res.status(403).json({
      errors: [{
        status: '403',
        title: 'Forbidden',
        detail: 'Admin or Super Admin access required'
      }]
    });
  }
  next();
};

/**
 * Middleware to check if user is a super admin
 */
const requireSuperAdmin = (req, res, next) => {
  if (!req.userRole || req.userRole !== 'super_admin') {
    return res.status(403).json({
      errors: [{
        status: '403',
        title: 'Forbidden',
        detail: 'Super Admin access required'
      }]
    });
  }
  next();
};

/**
 * Middleware to check if user is a regular user (not admin)
 */
const requireUser = (req, res, next) => {
  if (!req.userRole || req.userRole !== 'user') {
    return res.status(403).json({
      errors: [{
        status: '403',
        title: 'Forbidden',
        detail: 'User access only'
      }]
    });
  }
  next();
};

/**
 * Optional authentication middleware
 * Attaches user info if token is provided and valid, but doesn't require it
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      // No token provided, continue without user info
      req.userId = null;
      req.userRole = null;
      return next();
    }

    // Try to verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    
    next();
  } catch (error) {
    // Invalid token, continue without user info
    req.userId = null;
    req.userRole = null;
    next();
  }
};

module.exports = {
  authenticate,
  requireAdmin,
  requireSuperAdmin,
  requireUser,
  optionalAuthenticate
};
