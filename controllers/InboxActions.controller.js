const db = require('../models');
const User = db.user;
const Admin = db.admin;
const SuperAdmin = db.super_admin;
const InboxMessage = db.inbox_message;
const InboxMessageSerializer = require('../serializer/InboxMessage.serializer.js');
const BusinessError = require('../error/BusinessError');
const NotFoundError = require('../error/exception/NotFound');
const {
  createRetakeRequest,
  processRetakeResponse,
  createContactUsMessage,
  createBugReport,
  createSupportRequest
} = require('../services/notificationService');

/**
 * User requests an assessment retake
 * POST /inbox-actions/retake-request
 * Authenticated users only
 */
const requestRetake = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { reason } = req.body;

    // Check if user already has a pending retake request
    const pendingRequest = await InboxMessage.findOne({
      where: {
        sent_by_user_id: userId,
        type: 'retake_request',
        status: null
      }
    });

    if (pendingRequest) {
      const businessError = new BusinessError(400, 'Bad Request');
      businessError.addError('retake_request', 'You already have a pending retake request');
      throw businessError;
    }

    const message = await createRetakeRequest(userId, reason);
    const serialized = InboxMessageSerializer.serialize(message.toJSON());
    
    res.status(201).json(serialized);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin approves a retake request
 * POST /inbox-actions/retake-request/:messageId/approve
 * Admin/SuperAdmin only
 */
const approveRetakeRequest = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const adminId = req.userId;
    const role = req.userRole;

    // Get admin name
    let adminName = 'Admin';
    if (role === 'super_admin') {
      const superAdmin = await SuperAdmin.findByPk(adminId);
      if (superAdmin) adminName = superAdmin.username;
    } else {
      const admin = await Admin.findByPk(adminId);
      if (admin) adminName = admin.username;
    }

    const message = await processRetakeResponse(messageId, true, adminId, adminName, role === 'super_admin');
    const serialized = InboxMessageSerializer.serialize(message.toJSON());
    
    res.status(200).json({
      ...serialized,
      meta: { approved: true, processed_by: adminName }
    });
  } catch (error) {
    if (error.message === 'Message not found') {
      return next(new NotFoundError('Retake request not found', 'InboxMessage'));
    }
    if (error.message === 'This request has already been resolved') {
      const businessError = new BusinessError(400, 'Bad Request');
      businessError.addError('status', 'This request has already been resolved');
      return next(businessError);
    }
    next(error);
  }
};

/**
 * Admin disapproves a retake request
 * POST /inbox-actions/retake-request/:messageId/disapprove
 * Admin/SuperAdmin only
 */
const disapproveRetakeRequest = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const adminId = req.userId;
    const role = req.userRole;

    // Get admin name
    let adminName = 'Admin';
    if (role === 'super_admin') {
      const superAdmin = await SuperAdmin.findByPk(adminId);
      if (superAdmin) adminName = superAdmin.username;
    } else {
      const admin = await Admin.findByPk(adminId);
      if (admin) adminName = admin.username;
    }

    const message = await processRetakeResponse(messageId, false, adminId, adminName, role === 'super_admin');
    const serialized = InboxMessageSerializer.serialize(message.toJSON());
    
    res.status(200).json({
      ...serialized,
      meta: { approved: false, processed_by: adminName }
    });
  } catch (error) {
    if (error.message === 'Message not found') {
      return next(new NotFoundError('Retake request not found', 'InboxMessage'));
    }
    if (error.message === 'This request has already been resolved') {
      const businessError = new BusinessError(400, 'Bad Request');
      businessError.addError('status', 'This request has already been resolved');
      return next(businessError);
    }
    next(error);
  }
};

/**
 * Submit a contact us message
 * POST /inbox-actions/contact-us
 * Public (optional authentication)
 */
const submitContactUs = async (req, res, next) => {
  try {
    const userId = req.userId || null; // May be null if visitor
    const { subject, organization_name, email, message: msgContent } = req.body;

    const businessError = new BusinessError(400, 'Bad Request');

    // If not authenticated, organization_name and email are required
    if (!userId) {
      if (!organization_name) {
        businessError.addError('organization_name', 'Organization name is required for visitors');
      }
      if (!email) {
        businessError.addError('email', 'Email is required for visitors');
      }
    }

    if (!subject) {
      businessError.addError('subject', 'Subject is required');
    }
    if (!msgContent) {
      businessError.addError('message', 'Message is required');
    }

    if (businessError.errors.length > 0) {
      throw businessError;
    }

    // If authenticated, use user's info as fallback
    let finalOrgName = organization_name;
    let finalEmail = email;
    
    if (userId) {
      const user = await User.findByPk(userId);
      if (user) {
        finalOrgName = organization_name || user.organization_name;
        finalEmail = email || user.email;
      }
    }

    const payload = {
      subject,
      organization_name: finalOrgName,
      email: finalEmail,
      message: msgContent
    };

    const inboxMessage = await createContactUsMessage(payload, userId);
    const serialized = InboxMessageSerializer.serialize(inboxMessage.toJSON());
    
    res.status(201).json(serialized);
  } catch (error) {
    next(error);
  }
};

/**
 * Submit a bug report
 * POST /inbox-actions/bug-report
 * Authenticated users only
 */
const submitBugReport = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { category, subject, organization_name, email, message: msgContent } = req.body;

    const businessError = new BusinessError(400, 'Bad Request');

    if (!subject) {
      businessError.addError('subject', 'Subject is required');
    }
    if (!msgContent) {
      businessError.addError('message', 'Message is required');
    }

    if (businessError.errors.length > 0) {
      throw businessError;
    }

    const payload = {
      category: category || 'bug',
      subject,
      organization_name,
      email,
      message: msgContent
    };

    const inboxMessage = await createBugReport(userId, payload);
    const serialized = InboxMessageSerializer.serialize(inboxMessage.toJSON());
    
    res.status(201).json(serialized);
  } catch (error) {
    next(error);
  }
};

/**
 * Submit a support request
 * POST /inbox-actions/support-request
 * Authenticated users only
 */
const submitSupportRequest = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { category, subject, organization_name, email, message: msgContent } = req.body;

    const businessError = new BusinessError(400, 'Bad Request');

    if (!subject) {
      businessError.addError('subject', 'Subject is required');
    }
    if (!msgContent) {
      businessError.addError('message', 'Message is required');
    }

    if (businessError.errors.length > 0) {
      throw businessError;
    }

    const payload = {
      category: category || 'support',
      subject,
      organization_name,
      email,
      message: msgContent
    };

    const inboxMessage = await createSupportRequest(userId, payload);
    const serialized = InboxMessageSerializer.serialize(inboxMessage.toJSON());
    
    res.status(201).json(serialized);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestRetake,
  approveRetakeRequest,
  disapproveRetakeRequest,
  submitContactUs,
  submitBugReport,
  submitSupportRequest
};
