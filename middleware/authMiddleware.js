const jwt = require('jsonwebtoken');
const config = require('../config/app-config');
const db = require('../models');
const { getWeightConfig } = require('../services/weightConfigService');

/**
 * Helper: extract token from cookie (supports req.cookies or raw Cookie header)
 */
const getTokenFromCookie = (req, preferred = 'any') => {
  const pickToken = (tokens) => {
    if (preferred === 'user') return tokens.user_token || tokens.admin_token || null;
    if (preferred === 'admin') return tokens.admin_token || tokens.user_token || null;
    return tokens.admin_token || tokens.user_token || null;
  };

  // 1. Check parsed cookies if cookie-parser is used
  if (req.cookies) {
    return pickToken(req.cookies);
  }
// 2. Fallback for raw header parsing
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;
  const parsed = {};
const parts = cookieHeader.split(';').map(c => c.trim());
  for (const p of parts) {
    const [k, ...v] = p.split('=');
    if (k === 'admin_token' || k === 'user_token') {
      parsed[k] = decodeURIComponent(v.join('='));
    }
  }
  return pickToken(parsed);
};

/**
 * Middleware to verify JWT token and attach user information to request
 * Token is expected in the 'token' cookie only.
 */
const authenticate = async (req, res, next) => {
  try {
    const url = req.originalUrl || '';
    const normalizedUrl = url.toLowerCase();
    const isAssessmentProgressMeRoute = normalizedUrl.includes('/assessment-progress/me');
    const isUserPreferredRoute =
      (normalizedUrl.includes('/auth/me') && !normalizedUrl.includes('/auth/admin')) ||
      normalizedUrl.includes('/profile') ||
      isAssessmentProgressMeRoute;

    const isAdminPreferredRoute =
      normalizedUrl.includes('/auth/admin') ||
      normalizedUrl.includes('/admins') ||
      normalizedUrl.includes('/super-admins') ||
      (normalizedUrl.includes('/assessment-progress') && !isAssessmentProgressMeRoute);

    const token = getTokenFromCookie(
      req,
      isUserPreferredRoute ? 'user' : isAdminPreferredRoute ? 'admin' : 'any'
    );

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

    // Fetch total score based on user's sub-sector
    if (decoded.role === 'user') {
      const user = await db.user.findByPk(decoded.id, { attributes: ['sub_sector'] });
      if (user && user.sub_sector) {
        const weightConfig = await getWeightConfig(user.sub_sector);
        req.totalscore = weightConfig.total;
      }
    }
    
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
 * Attaches user info if a valid token cookie exists, otherwise continues
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const token = getTokenFromCookie(req);

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;

    // Fetch total score based on user's sub-sector
    if (decoded.role === 'user') {
      const user = await db.user.findByPk(decoded.id, { attributes: ['sub_sector'] });
      if (user && user.sub_sector) {
        const weightConfig = await getWeightConfig(user.sub_sector);
        req.totalscore = weightConfig.total;
      }
    }

    return next();
  } catch (error) {
    return next();
  }
};


/**
 * SSE-specific authentication middleware
 * Uses cookie-based auth first, with legacy query/header fallback
 */
const authenticateSSE = async (req, res, next) => {
  try {
    // Prefer cookie auth for SSE
    let token = getTokenFromCookie(req);

   

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

    // Fetch total score based on user's sub-sector
    if (decoded.role === 'user') {
      const user = await db.user.findByPk(decoded.id, { attributes: ['sub_sector'] });
      if (user && user.sub_sector) {
        const weightConfig = await getWeightConfig(user.sub_sector);
        req.totalscore = weightConfig.total;
      }
    }

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

module.exports = {
  authenticate,
  authenticateSSE,
  requireAdmin,
  requireSuperAdmin,
  requireUser,
  optionalAuthenticate
};
