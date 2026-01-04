const db = require('../models');
const User = db.user;
const UserSerializer = require('../serializer/userserializer.js');
const UserInlineSerializer = require('../serializer/User.inline.serializer.js');
const { createCrudOperations } = require('../utils/crudOperations.js');
const NotFoundError = require('../error/exception/NotFound.js');
const BusinessError = require("../error/BusinessError");

const allowedFields = [
  "id",
  "organization_name",
  "phone_number",
  "email",
  "next_allowed_assessment_date",
  "created_at",
  "updated_at",
];

const crudOps = createCrudOperations({
  Model: User,
  modelName: "User",
  Serializer: UserSerializer,
  InlineSerializer: UserInlineSerializer,
  allowedIncludes: [],
  allowedFields,
  defaultIncludes: [],
});

// Get all users with pagination
const getAllUsers = async (req, res, next) => {
  try {
    await crudOps.getAllWithPagination(req, res, next);
  } catch (error) {
    next(error);
  }
};

// Get user by ID
const getUserById = async (req, res, next) => {
  try {
    req.params.id = req.params.userId;
    await crudOps.getById(req, res, next);
  } catch (error) {
    next(error);
  }
};

// Create a new user (admin can do this)
const createUser = async (req, res, next) => {
  try {
    const businessError = new BusinessError(400, "Bad Request");
    
    // Check for email uniqueness
    if (req.body.email) {
      const existingUser = await User.findOne({
        where: { email: req.body.email }
      });
      
      if (existingUser) {
        businessError.addError('attributes.email', 'Email already exists');
      }
    }

    if (businessError.errors.length > 0) throw businessError;

    await crudOps.create(req, res, next);
  } catch (error) {
    next(error);
  }
};

// Update a user (admin can do this)
const updateUser = async (req, res, next) => {
  try {
    const id = req.params.userId;
    const user = await User.findByPk(id);
    const businessError = new BusinessError(400, "Bad Request");
    
    if (!user) {
      throw new NotFoundError('User not found', 'User');
    }
    
    // Check email uniqueness if email is being updated
    if (req.body.email && req.body.email !== user.email) {
      const existingUser = await User.findOne({
        where: { email: req.body.email }
      });
      
      if (existingUser) {
        businessError.addError('attributes.email', 'Email already exists');
      }
    }

    if (businessError.errors.length > 0) throw businessError;

    req.params.id = req.params.userId;
    await crudOps.update(req, res, next);
  } catch (error) {
    next(error);
  }
};

// Delete a user (admin can do this)
const deleteUser = async (req, res, next) => {
  try {
    const id = req.params.userId;
    const user = await User.findByPk(id);
    
    if (!user) {
      throw new NotFoundError('User not found', 'User');
    }

    req.params.id = req.params.userId;
    await crudOps.remove(req, res, next);
  } catch (error) {
    next(error);
  }
};

// Get current user's own profile
const getOwnProfile = async (req, res, next) => {
  try {
    req.params.id = req.userId;;
    await crudOps.getById(req, res, next);
  } catch (error) {
    next(error);
  }
};

// Update current user's own profile
const updateOwnProfile = async (req, res, next) => {
  try {
    const userId = req.userId;;
    const user = await User.findByPk(userId);
    const businessError = new BusinessError(400, "Bad Request");
    
    if (!user) {
      throw new NotFoundError('User not found', 'User');
    }
    
    // Check email uniqueness if email is being updated
    if (req.body.email && req.body.email !== user.email) {
      const existingUser = await User.findOne({
        where: { email: req.body.email }
      });
      
      if (existingUser) {
        businessError.addError('attributes.email', 'Email already exists');
      }
    }

    if (businessError.errors.length > 0) throw businessError;

    req.params.id = userId;
    await crudOps.update(req, res, next);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getOwnProfile,
  updateOwnProfile,
};
