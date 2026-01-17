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
  Model: SuperAdmin,
  modelName: "SuperAdmin",
  Serializer: AdminSerializer,
  InlineSerializer: AdminInlineSerializer,
  allowedIncludes: ["creator", "sent_messages", "read_messages"],
  allowedFields,
  defaultIncludes: [],
});

// Update super admin's own details
const updateMe = async (req, res, next) => {
  try {
    const superAdminId = req.userId;
    const superAdmin = await SuperAdmin.findByPk(superAdminId);

    if (!superAdmin) {
      throw new NotFoundError('Super admin not found', 'SuperAdmin');
    }

    const businessError = new BusinessError(400, "Bad Request");

    // Username uniqueness (admins + super admins)
    if (req.body.username && req.body.username !== superAdmin.username) {
      const exists = await Promise.any([
        db.admin.findOne({ where: { username: req.body.username } }),
        db.super_admin.findOne({ where: { username: req.body.username } })
      ]).catch(() => null);

      if (exists) {
        businessError.addError('attributes.username', 'Username already exists');
      }
    }

    // Email uniqueness (admins + super admins)
    if (req.body.email && req.body.email !== superAdmin.email) {
      const exists = await Promise.any([
        db.admin.findOne({ where: { email: req.body.email } }),
        db.super_admin.findOne({ where: { email: req.body.email } })
      ]).catch(() => null);

      if (exists) {
        businessError.addError('attributes.email', 'Email already exists');
      }
    }

    if (businessError.errors.length > 0) throw businessError;

    // Update (password hashing handled by model hook)
    req.params.id = superAdminId;
    await crudOps.update(req, res, next);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateMe
};