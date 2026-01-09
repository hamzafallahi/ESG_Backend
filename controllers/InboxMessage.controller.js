const db = require('../models');
const InboxMessage = db.inbox_message;
const InboxMessageSerializer = require('../serializer/InboxMessage.serializer.js');
const InboxMessageInlineSerializer = require('../serializer/InboxMessage.inline.serializer.js');
const { createCrudOperations } = require('../utils/crudOperations.js');
const NotFoundError = require('../error/exception/NotFound.js');
const BusinessError = require("../error/BusinessError");
const { Op } = require('sequelize');

const allowedFields = [
  "id",
  "sent_by_user_id",
  "sent_by_admin_id",
  "sent_by_super_admin_id",
  "type",
  "payload",
  "status",
  "created_at",
  "updated_at",
];

const crudOps = createCrudOperations({
  Model: InboxMessage,
  modelName: "InboxMessage",
  Serializer: InboxMessageSerializer,
  InlineSerializer: InboxMessageInlineSerializer,
  allowedIncludes: ["sender_user", "sender_admin", "sender_super_admin", "reads"],
  allowedFields,
  defaultIncludes: [],
});

// Get all inbox messages with pagination
const getAllInboxMessages = async (req, res, next) => {
  try {
    await crudOps.getAllWithPagination(req, res, next);
  } catch (error) {
    next(error);
  }
};

// Get inbox message by ID
const getInboxMessageById = async (req, res, next) => {
  try {
    req.params.id = req.params.messageId;
    await crudOps.getById(req, res, next);
  } catch (error) {
    next(error);
  }
};

// Create a new inbox message
const createInboxMessage = async (req, res, next) => {
  try {
    const businessError = new BusinessError(400, "Bad Request");
    
    // Validate that at least one sender is specified
    const { sent_by_user_id, sent_by_admin_id, sent_by_super_admin_id } = req.body;
    const senderCount = [sent_by_user_id, sent_by_admin_id, sent_by_super_admin_id].filter(Boolean).length;
    
    if (senderCount === 0) {
      businessError.addError('attributes', 'At least one sender must be specified (sent_by_user_id, sent_by_admin_id, or sent_by_super_admin_id)');
    }
    
    // Validate message type
    const validTypes = ['contact_us', 'retake_request', 'support_request', 'bug_report', 'result_feedback'];
    if (req.body.type && !validTypes.includes(req.body.type)) {
      businessError.addError('attributes.type', `Invalid message type. Must be one of: ${validTypes.join(', ')}`);
    }
    
    if (businessError.errors.length > 0) {
      throw businessError;
    }
    
    await crudOps.create(req, res, next);
  } catch (error) {
    next(error);
  }
};

// Update an inbox message
const updateInboxMessage = async (req, res, next) => {
  try {
    req.params.id = req.params.messageId;
    
    const businessError = new BusinessError(400, "Bad Request");
    
    // Validate message type if provided
    const validTypes = ['contact_us', 'retake_request', 'support_request', 'bug_report', 'result_feedback'];
    if (req.body.type && !validTypes.includes(req.body.type)) {
      businessError.addError('attributes.type', `Invalid message type. Must be one of: ${validTypes.join(', ')}`);
    }
    
    if (businessError.errors.length > 0) {
      throw businessError;
    }
    
    await crudOps.update(req, res, next);
  } catch (error) {
    next(error);
  }
};

// Delete an inbox message
const deleteInboxMessage = async (req, res, next) => {
  try {
    req.params.id = req.params.messageId;
    await crudOps.remove(req, res, next);
  } catch (error) {
    next(error);
  }
};

// Get all inbox messages by user ID
const getAllInboxMessagesByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    // Add filter for sent_by_user_id
    if (!req.query.filter) {
      req.query.filter = {};
    }
    req.query.filter.sent_by_user_id = userId;
    
    await crudOps.getAllWithPagination(req, res, next);
  } catch (error) {
    next(error);
  }
};

// Check if current user has a pending retake request
const checkPendingRetakeRequest = async (req, res, next) => {
  try {
    const userId = req.userId; // Get user ID from token
    
    // Check for retake_request messages with null or unresolved status
    const pendingRequest = await InboxMessage.findOne({
      where: {
        sent_by_user_id: userId,
        type: 'retake_request',
        [Op.or]: [
          { status: null },
          { status: 'unresolved' }
        ]
      },
      order: [['created_at', 'DESC']],
    });
    
    res.status(200).json({
      hasPendingRequest: !!pendingRequest,
      pendingRequest: pendingRequest ? InboxMessageInlineSerializer.serialize(pendingRequest) : null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllInboxMessages,
  getInboxMessageById,
  createInboxMessage,
  updateInboxMessage,
  deleteInboxMessage,
  getAllInboxMessagesByUser,
  checkPendingRetakeRequest,
};
