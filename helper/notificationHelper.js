const { sendToUser, sendToAllAdmins } = require('../services/sse');

/**
 * Event types for SSE notifications
 */
const EVENT_TYPES = {
  RETAKE_REQUEST: 'retake_request',
  RETAKE_RESPONSE: 'retake_response',
  CONTACT_US: 'contact_us',
  BUG_REPORT: 'bug_report',
  SUPPORT_REQUEST: 'support_request',
  RESULT_FEEDBACK: 'result_feedback',
  RANK_UPDATE: 'rank_update'
};

/**
 * Notify a specific user with an SSE event
 */
function notifyUser(recipientId, eventType, data) {
  const payload = {
    eventType,
    timestamp: new Date().toISOString(),
    data
  };
  sendToUser(recipientId, payload);
}

/**
 * Notify all connected admins/super admins with an SSE event
 */
function notifyAllAdmins(eventType, data) {
  const payload = {
    eventType,
    timestamp: new Date().toISOString(),
    data
  };
  sendToAllAdmins(payload);
}

/**
 * Notify admins about a new retake request from a user
 */
function notifyAdminsOfRetakeRequest(userId, userName, organizationName, reason, messageId) {
  notifyAllAdmins(EVENT_TYPES.RETAKE_REQUEST, {
    messageId,
    userId,
    userName,
    organizationName,
    reason: reason || null,
    message: `${organizationName} has requested an assessment retake.`
  });
}

/**
 * Notify a user about retake request approval/disapproval
 */
function notifyUserOfRetakeResponse(userId, approved, adminName) {
  notifyUser(userId, EVENT_TYPES.RETAKE_RESPONSE, {
    approved,
    message: approved 
      ? `Your assessment retake request has been approved by ${adminName}. You can now retake the assessment.`
      : `Your assessment retake request has been declined by ${adminName}.`
  });
}

/**
 * Notify admins about a new contact us message
 */
function notifyAdminsOfContactUs(payload, messageId, userId = null) {
  notifyAllAdmins(EVENT_TYPES.CONTACT_US, {
    messageId,
    userId,
    subject: payload.subject,
    organizationName: payload.organization_name,
    email: payload.email,
    message: `New contact message: ${payload.subject}`
  });
}

/**
 * Notify admins about a bug report
 */
function notifyAdminsOfBugReport(userId, userName, organizationName, payload, messageId) {
  notifyAllAdmins(EVENT_TYPES.BUG_REPORT, {
    messageId,
    userId,
    userName,
    organizationName,
    subject: payload.subject,
    category: payload.category,
    message: `New bug report from ${organizationName}: ${payload.subject}`
  });
}

/**
 * Notify admins about a support request
 */
function notifyAdminsOfSupportRequest(userId, userName, organizationName, payload, messageId) {
  notifyAllAdmins(EVENT_TYPES.SUPPORT_REQUEST, {
    messageId,
    userId,
    userName,
    organizationName,
    subject: payload.subject,
    category: payload.category,
    message: `New support request from ${organizationName}: ${payload.subject}`
  });
}

/**
 * Notify admins about result feedback
 */
function notifyAdminsOfResultFeedback(userId, userName, organizationName, resultId, messageId) {
  notifyAllAdmins(EVENT_TYPES.RESULT_FEEDBACK, {
    messageId,
    userId,
    userName,
    organizationName,
    resultId,
    message: `${organizationName} has submitted feedback on their assessment result.`
  });
}

/**
 * Notify a user that their ranking has been updated.
 */
function notifyUserOfRankUpdate(userId, { rank, previousRank, totalScore, totalParticipants, year }) {
  notifyUser(userId, EVENT_TYPES.RANK_UPDATE, {
    rank,
    previousRank,
    totalScore,
    totalParticipants,
    year,
    message: `Your ranking has been updated: #${rank} of ${totalParticipants}`
  });
}

module.exports = {
  EVENT_TYPES,
  notifyUser,
  notifyAllAdmins,
  notifyAdminsOfRetakeRequest,
  notifyUserOfRetakeResponse,
  notifyAdminsOfContactUs,
  notifyAdminsOfBugReport,
  notifyAdminsOfSupportRequest,
  notifyAdminsOfResultFeedback,
  notifyUserOfRankUpdate
};