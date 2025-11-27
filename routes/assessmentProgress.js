const express = require('express');
const router = express.Router();
const assessmentProgressController = require('../controllers/AssessmentProgress.controller');
const { create, update, getAll, delete: deleteValidation } = require('../validation/AssessmentProgress.rules.js');
const AssessmentProgressDeserializer = require('../deserializer/AssessmentProgressDeserializer');
const deserializeMiddleware = require('../middleware/deserializeMiddleware');
const validate = require('../middleware/validationMiddleware');
const {  requireAdmin } = require('../middleware/authMiddleware');

// User routes - require authentication
router.get('/me', assessmentProgressController.getCurrentUserProgress);
router.patch('/me',  validate(update), deserializeMiddleware(AssessmentProgressDeserializer), assessmentProgressController.updateCurrentUserProgress);
router.post('/me/reset',  assessmentProgressController.resetCurrentUserProgress);

// Admin routes - require admin role
router.get('/', requireAdmin, validate(getAll), assessmentProgressController.getAll);
router.get('/:id', requireAdmin, assessmentProgressController.getById);
router.get('/user/:userId', requireAdmin, assessmentProgressController.getByUserId);
router.post('/', requireAdmin, validate(create), deserializeMiddleware(AssessmentProgressDeserializer), assessmentProgressController.create);
router.patch('/:id', requireAdmin, validate(update), deserializeMiddleware(AssessmentProgressDeserializer), assessmentProgressController.update);
router.delete('/:id', requireAdmin, validate(deleteValidation), assessmentProgressController.remove);

module.exports = router;
