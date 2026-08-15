const jwt = require('jsonwebtoken');
const config = require('../config/app-config');
const db = require('../models');
const { getWeightConfig } = require('../services/weightConfigService');

const tryVerifyWithLocalKey = (token) => {
  const key = config.JWT_PUBLIC_KEY || config.JWT_SECRET;
  if (!key) return null;

  try {
    return jwt.verify(token, key, { algorithms: ['RS256'] });
  } catch (error) {
    return null;
  }
};

const tryVerifyWithEventizerKey = (token) => {
  const key = config.EVENTIZER_PUBLIC_KEY;
  if (!key) return null;

  try {
    return jwt.verify(token, key, { algorithms: ['RS256'] });
  } catch (error) {
    return null;
  }
};

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

const verifyAndDecodeToken = (token, req, isAdminRoute) => {
  if (isAdminRoute) {
    const decodedLocal = tryVerifyWithLocalKey(token);
    if (decodedLocal) return decodedLocal;
    throw new Error('Invalid admin token');
  }

  const decodedEventizer = tryVerifyWithEventizerKey(token);
  if (decodedEventizer) return decodedEventizer;

  // Backward compatibility: allow local user token while migrating.
  const decodedLocal = tryVerifyWithLocalKey(token);
  if (decodedLocal) return decodedLocal;

  throw new Error('Invalid user token');
};

/**
 * Middleware to verify JWT token and attach user information to request
 * Token is expected in the 'token' cookie only.
 */
const authenticate = async (req, res, next) => {
  try {
    const url = req.originalUrl || '';
    const normalizedUrl = url.toLowerCase();
    const isRankingRoute = normalizedUrl.includes('/rankings');
    const isRankingAdminAction =
      normalizedUrl.includes('/rankings/reset') || normalizedUrl.includes('/rankings/recompute');
    const isInboxActionsRoute = normalizedUrl.includes('/inbox-actions');
    const isInboxAdminAction =
      normalizedUrl.includes('/retake-request/') &&
      (normalizedUrl.includes('/approve') || normalizedUrl.includes('/disapprove'));
    const isAssessmentProgressMeRoute = normalizedUrl.includes('/assessment-progress/me');
    const isResultSubmissionRoute =
      normalizedUrl.includes('/results') && req.method === 'POST';
    const isUserPreferredRoute =
      (normalizedUrl.includes('/auth/me') && !normalizedUrl.includes('/auth/admin')) ||
      normalizedUrl.includes('/profile') ||
      (isRankingRoute && !isRankingAdminAction) ||
      (isInboxActionsRoute && !isInboxAdminAction) ||
      isAssessmentProgressMeRoute ||
      isResultSubmissionRoute;

    const isAdminPreferredRoute =
      normalizedUrl.includes('/auth/admin') ||
      normalizedUrl.includes('/admins') ||
      normalizedUrl.includes('/super-admins') ||
      isRankingAdminAction ||
      isInboxAdminAction ||
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

    const decoded = verifyAndDecodeToken(token, req, isAdminPreferredRoute || (!isUserPreferredRoute && !isAdminPreferredRoute && normalizedUrl.includes('/admin')));
    
    req.userId = decoded.id;
    req.userRole = decoded.role;

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

    const decoded = verifyAndDecodeToken(token, req, false);
    req.userId = decoded.id;
    req.userRole = decoded.role;

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
    const url = (req.originalUrl || '').toLowerCase();
    const prefersAdmin = url.includes('/events/admin');
    const token = getTokenFromCookie(req, prefersAdmin ? 'admin' : 'user');

    if (!token) {
      return res.status(401).json({ 
        errors: [{
          status: '401',
          title: 'Unauthorized',
          detail: 'No token provided'
        }]
      });
    }

    const decoded = verifyAndDecodeToken(token, req, prefersAdmin);
    req.userId = decoded.id;
    req.userRole = decoded.role;

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
