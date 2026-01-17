const express = require('express');
const router = express.Router();
const adminController = require('../controllers/Admin.controller');
const { create, update, getAll, delete: deleteValidation } = require('../validation/Admin.rules.js');
const AdminDeserializer = require('../deserializer/admindeserializer.js');
const deserializeMiddleware = require('../middleware/deserializeMiddleware');
const validate = require('../middleware/validationMiddleware');
const { requireSuperAdmin,requireAdmin  } = require('../middleware/authMiddleware');

router.patch('/me',requireAdmin,validate(update),deserializeMiddleware(AdminDeserializer),adminController.updateMe);

// All below admin routes require super admin role (authentication already handled in index.js)
router.use(requireSuperAdmin);

router.get('/', validate(getAll), adminController.getAllAdmins);

router.get('/:adminId', adminController.getAdminById);

router.post('/', validate(create), deserializeMiddleware(AdminDeserializer), adminController.createAdmin);

router.patch('/:adminId', validate(update), deserializeMiddleware(AdminDeserializer), adminController.updateAdmin);

router.delete('/:adminId', validate(deleteValidation), adminController.deleteAdmin);

module.exports = router;
