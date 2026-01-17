const express = require('express');
const router = express.Router();

const superAdminController = require('../controllers/SuperAdmin.controller.js');
const { update} = require('../validation/Admin.rules.js');
const AdminDeserializer = require('../deserializer/admindeserializer');
const deserializeMiddleware = require('../middleware/deserializeMiddleware');
const validate = require('../middleware/validationMiddleware');
const { requireSuperAdmin } = require('../middleware/authMiddleware');

router.use(requireSuperAdmin);

router.patch('/me',validate(update),deserializeMiddleware(AdminDeserializer),superAdminController.updateMe);








module.exports = router;
