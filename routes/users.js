const express = require('express');
const router = express.Router();
const userController = require('../controllers/User.controller');
const { create, update, getAll, delete: deleteValidation } = require('../validation/User.rules.js');
const UserDeserializer = require('../deserializer/userdeserializer.js');
const deserializeMiddleware = require('../middleware/deserializeMiddleware');
const validate = require('../middleware/validationMiddleware');
const { requireAdmin } = require('../middleware/authMiddleware');

// All user management routes require admin or super admin role
router.use(requireAdmin);

router.get('/', validate(getAll), userController.getAllUsers);

router.get('/:userId', userController.getUserById);

router.post('/', validate(create), deserializeMiddleware(UserDeserializer), userController.createUser);

router.patch('/:userId', validate(update), deserializeMiddleware(UserDeserializer), userController.updateUser);

router.delete('/:userId', validate(deleteValidation), userController.deleteUser);

module.exports = router;
