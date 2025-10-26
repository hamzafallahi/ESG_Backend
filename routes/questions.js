const express = require('express');
const router = express.Router();
const questionController = require('../controllers/Question.controller');
const { create, update, getAll }  = require('../validation/Questions.rules.js');
const QuestionDeserializer = require('../deserializer/questiondeserializer.js');
const deserializeMiddleware = require('../middleware/deserializeMiddleware');
const validate = require('../middleware/validationMiddleware');
const { requireAdmin } = require('../middleware/authMiddleware');

// Public reads (authentication already handled in index.js)
router.get('/', validate(getAll), questionController.getAllQuestions);

router.get('/:questionId', questionController.getQuestionById);

// Protected routes - only admins and super admins can create/update/delete
router.post('/', requireAdmin, validate(create), deserializeMiddleware(QuestionDeserializer), questionController.createQuestion);

router.patch('/:questionId', requireAdmin, validate(update), deserializeMiddleware(QuestionDeserializer), questionController.updateQuestion);

router.delete('/:questionId', requireAdmin, questionController.deleteQuestion);

module.exports = router;
