const db = require('../models');
const MessageRead = db.message_read;
const MessageReadSerializer = require('../serializer/MessageRead.serializer.js');
const MessageReadInlineSerializer = require('../serializer/MessageRead.inline.serializer.js');
const { createCrudOperations } = require('../utils/crudOperations.js');
const NotFoundError = require('../error/exception/NotFound.js');
const BusinessError = require("../error/BusinessError");

const allowedFields = [
  "id",
  "message_id",
  "admin_id",
  "super_admin_id",
  "created_at",
  "updated_at",
];

const crudOps = createCrudOperations({
  Model: MessageRead,
  modelName: "MessageRead",
  Serializer: MessageReadSerializer,
  InlineSerializer: MessageReadInlineSerializer,
  allowedIncludes: ["message", "reader_admin", "reader_super_admin"],
  allowedFields,
  defaultIncludes: [],
});

// Get all message reads with pagination
const getAllMessageReads = async (req, res, next) => {
  try {
    await crudOps.getAllWithPagination(req, res, next);
  } catch (error) {
    next(error);
  }
};

// Get message read by ID
const getMessageReadById = async (req, res, next) => {
  try {
    req.params.id = req.params.readId;
    await crudOps.getById(req, res, next);
  } catch (error) {
    next(error);
  }
};

// Create a new message read (mark message as read)
const createMessageRead = async (req, res, next) => {
  try {
    const businessError = new BusinessError(400, "Bad Request");
    
    // Validate that exactly one reader is specified
    const { admin_id, super_admin_id } = req.body;
    
    if (!admin_id && !super_admin_id) {
      businessError.addError('attributes', 'Either admin_id or super_admin_id must be provided');
    }
    
    if (admin_id && super_admin_id) {
      businessError.addError('attributes', 'Cannot have both admin_id and super_admin_id set');
    }
    
    // Validate message_id is provided
    if (!req.body.message_id) {
      businessError.addError('attributes.message_id', 'Message ID is required');
    }
    
    if (businessError.errors.length > 0) {
      throw businessError;
    }
    
    // Check if already marked as read by this user
    const whereCondition = {
      message_id: req.body.message_id
    };
    
    if (admin_id) {
      whereCondition.admin_id = admin_id;
    } else if (super_admin_id) {
      whereCondition.super_admin_id = super_admin_id;
    }
    
    const existingRead = await MessageRead.findOne({ where: whereCondition });
    
    if (existingRead) {
      businessError.addError('attributes', 'Message already marked as read by this user');
      throw businessError;
    }
    
    await crudOps.create(req, res, next);
  } catch (error) {
    next(error);
  }
};

// Update a message read (unlikely to be needed, but included for completeness)
const updateMessageRead = async (req, res, next) => {
  try {
    req.params.id = req.params.readId;
    
    const businessError = new BusinessError(400, "Bad Request");
    
    // Validate that exactly one reader is specified if updating reader
    const { admin_id, super_admin_id } = req.body;
    
    if (admin_id !== undefined || super_admin_id !== undefined) {
      if (!admin_id && !super_admin_id) {
        businessError.addError('attributes', 'Either admin_id or super_admin_id must be provided');
      }
      
      if (admin_id && super_admin_id) {
        businessError.addError('attributes', 'Cannot have both admin_id and super_admin_id set');
      }
    }
    
    if (businessError.errors.length > 0) {
      throw businessError;
    }
    
    await crudOps.update(req, res, next);
  } catch (error) {
    next(error);
  }
};

// Delete a message read (unmark as read)
const deleteMessageRead = async (req, res, next) => {
  try {
    req.params.id = req.params.readId;
    await crudOps.remove(req, res, next);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMessageReads,
  getMessageReadById,
  createMessageRead,
  updateMessageRead,
  deleteMessageRead,
};
