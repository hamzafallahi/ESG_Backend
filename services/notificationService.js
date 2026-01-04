const db = require('../models/index.js');
const {
  notifyAdminsOfRetakeRequest,
  notifyUserOfRetakeResponse,
  notifyAdminsOfContactUs,
  notifyAdminsOfBugReport,
  notifyAdminsOfSupportRequest,
  notifyAdminsOfResultFeedback
} = require('../helper/notificationHelper.js');

const InboxMessage = db.inbox_message;
const User = db.user;

/**
 * Create a retake request and notify admins
 */
async function createRetakeRequest(userId, reason = null) {
  const user = await User.findByPk(userId);
  if (!user) throw new Error('User not found');

  const message = await InboxMessage.create({
    sent_by_user_id: userId,
    sent_by_admin_id: null,
    sent_by_super_admin_id: null,
    type: 'retake_request',
    payload: { reason: reason || null },
    status: null
  });

  // Notify all connected admins
  notifyAdminsOfRetakeRequest(
    userId,
    user.organization_name,
    user.organization_name,
    reason,
    message.id
  );

  return message;
}

/**
 * Process retake request response (approve/disapprove)
 */
async function processRetakeResponse(messageId, approved, adminId, adminName, isSuperAdmin = false) {
  const message = await InboxMessage.findByPk(messageId);
  if (!message) throw new Error('Message not found');
  if (message.type !== 'retake_request') throw new Error('Invalid message type');
  if (message.status === 'resolved') throw new Error('This request has already been resolved');

  // Update message status to resolved
  await message.update({ status: 'resolved' });

  // If approved, reset user's next_allowed_assessment_date
  if (approved && message.sent_by_user_id) {
    const user = await User.findByPk(message.sent_by_user_id);
    if (user) {
      await user.update({ next_allowed_assessment_date: null });
    }
  }

  // Notify the user who requested the retake
  if (message.sent_by_user_id) {
    notifyUserOfRetakeResponse(message.sent_by_user_id, approved, adminName);
  }

  return message;
}

/**
 * Create a contact us message and notify admins
 */
async function createContactUsMessage(payload, userId = null) {
  const message = await InboxMessage.create({
    sent_by_user_id: userId,
    sent_by_admin_id: null,
    sent_by_super_admin_id: null,
    type: 'contact_us',
    payload: {
      subject: payload.subject,
      organization_name: payload.organization_name,
      email: payload.email,
      message: payload.message
    },
    status: null
  });

  // Notify all connected admins
  notifyAdminsOfContactUs(payload, message.id, userId);

  return message;
}

/**
 * Create a bug report and notify admins
 */
async function createBugReport(userId, payload) {
  const user = await User.findByPk(userId);
  if (!user) throw new Error('User not found');

  const message = await InboxMessage.create({
    sent_by_user_id: userId,
    sent_by_admin_id: null,
    sent_by_super_admin_id: null,
    type: 'bug_report',
    payload: {
      category: payload.category || 'bug',
      subject: payload.subject,
      organization_name: payload.organization_name || user.organization_name,
      email: payload.email || user.email,
      message: payload.message
    },
    status: null
  });

  // Notify all connected admins
  notifyAdminsOfBugReport(
    userId,
    user.organization_name,
    user.organization_name,
    payload,
    message.id
  );

  return message;
}

/**
 * Create a support request and notify admins
 */
async function createSupportRequest(userId, payload) {
  const user = await User.findByPk(userId);
  if (!user) throw new Error('User not found');

  const message = await InboxMessage.create({
    sent_by_user_id: userId,
    sent_by_admin_id: null,
    sent_by_super_admin_id: null,
    type: 'support_request',
    payload: {
      category: payload.category || 'support',
      subject: payload.subject,
      organization_name: payload.organization_name || user.organization_name,
      email: payload.email || user.email,
      message: payload.message
    },
    status: null
  });

  // Notify all connected admins
  notifyAdminsOfSupportRequest(
    userId,
    user.organization_name,
    user.organization_name,
    payload,
    message.id
  );

  return message;
}

/**
 * Create a result feedback message and notify admins
 */
async function createResultFeedback(userId, resultId) {
  const user = await User.findByPk(userId);
  if (!user) throw new Error('User not found');

  const message = await InboxMessage.create({
    sent_by_user_id: userId,
    sent_by_admin_id: null,
    sent_by_super_admin_id: null,
    type: 'result_feedback',
    payload: { result_id: resultId },
    status: null
  });

  // Notify all connected admins
  notifyAdminsOfResultFeedback(
    userId,
    user.organization_name,
    user.organization_name,
    resultId,
    message.id
  );

  return message;
}

module.exports = {
  createRetakeRequest,
  processRetakeResponse,
  createContactUsMessage,
  createBugReport,
  createSupportRequest,
  createResultFeedback
};
