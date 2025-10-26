const db = require('../models');
const Admin = db.admin;
const SuperAdmin = db.super_admin;
const AdminSerializer = require('../serializer/adminserializer.js');
const AdminInlineSerializer = require('../serializer/Admin.inline.serializer.js');
const { createCrudOperations } = require('../utils/crudOperations.js');
const NotFoundError = require('../error/exception/NotFound.js');
const BusinessError = require("../error/BusinessError");

const allowedFields = [
  "id",
  "username",
  "email",
  "first_name",
  "last_name",
  "is_active",
  "created_by",
  "created_at",
  "updated_at",
];

const crudOps = createCrudOperations({
  Model: Admin,
  modelName: "Admin",
  Serializer: AdminSerializer,
  InlineSerializer: AdminInlineSerializer,
  allowedIncludes: ["creator"],
  allowedFields,
  defaultIncludes: [],
});

// Get all admins with pagination
const getAllAdmins = async (req, res, next) => {
  try {
    await crudOps.getAllWithPagination(req, res, next);
  } catch (error) {
    next(error);
  }
};

// Get admin by ID
const getAdminById = async (req, res, next) => {
  try {
    req.params.id = req.params.adminId;
    await crudOps.getById(req, res, next);
  } catch (error) {
    next(error);
  }
};

// Create a new admin (only super admin can do this)
const createAdmin = async (req, res, next) => {
  try {
    const businessError = new BusinessError(400, "Bad Request");
    
    // Check for username uniqueness
    if (req.body.username) {
      const existingAdmin = await Admin.findOne({
        where: { username: req.body.username }
      });
      const existingSuperAdmin = await SuperAdmin.findOne({
        where: { username: req.body.username }
      });
      
      if (existingAdmin || existingSuperAdmin) {
        businessError.addError('attributes.username', 'Username already exists');
      }
    }

    // Check for email uniqueness
    if (req.body.email) {
      const existingAdmin = await Admin.findOne({
        where: { email: req.body.email }
      });
      const existingSuperAdmin = await SuperAdmin.findOne({
        where: { email: req.body.email }
      });
      
      if (existingAdmin || existingSuperAdmin) {
        businessError.addError('attributes.email', 'Email already exists');
      }
    }

    if (businessError.errors.length > 0) throw businessError;

    // Set created_by to the current super admin
    req.body.created_by = req.userId;

    await crudOps.create(req, res, next);
  } catch (error) {
    next(error);
  }
};

// Update an admin (only super admin can do this)
const updateAdmin = async (req, res, next) => {
  try {
    const id = req.params.adminId;
    const admin = await Admin.findByPk(id);
    const businessError = new BusinessError(400, "Bad Request");
    
    if (!admin) {
      throw new NotFoundError('Admin not found', 'Admin');
    }
    
    // Check username uniqueness if username is being updated
    if (req.body.username && req.body.username !== admin.username) {
      const existingAdmin = await Admin.findOne({
        where: { username: req.body.username }
      });
      const existingSuperAdmin = await SuperAdmin.findOne({
        where: { username: req.body.username }
      });
      
      if (existingAdmin || existingSuperAdmin) {
        businessError.addError('attributes.username', 'Username already exists');
      }
    }

    // Check email uniqueness if email is being updated
    if (req.body.email && req.body.email !== admin.email) {
      const existingAdmin = await Admin.findOne({
        where: { email: req.body.email }
      });
      const existingSuperAdmin = await SuperAdmin.findOne({
        where: { email: req.body.email }
      });
      
      if (existingAdmin || existingSuperAdmin) {
        businessError.addError('attributes.email', 'Email already exists');
      }
    }

    if (businessError.errors.length > 0) throw businessError;

    req.params.id = req.params.adminId;
    await crudOps.update(req, res, next);
  } catch (error) {
    next(error);
  }
};

// Delete an admin (soft delete - only super admin can do this)
const deleteAdmin = async (req, res, next) => {
  try {
    const id = req.params.adminId;
    const admin = await Admin.findByPk(id);
    
    if (!admin) {
      throw new NotFoundError('Admin not found', 'Admin');
    }

    req.params.id = req.params.adminId;
    await crudOps.delete(req, res, next);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
};
