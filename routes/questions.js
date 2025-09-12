const express = require('express');
const router = express.Router();
const questionController = require('../controllers/Question.controller');
const { create, update, getAll }  = require('../validation/Questions.rules.js');
const QuestionDeserializer = require('../deserializer/questiondeserializer.js');
const deserializeMiddleware = require('../middleware/deserializeMiddleware');
const validate = require('../middleware/validationMiddleware');

router.get('/', validate(getAll), questionController.getAllQuestions);

router.get('/:questionId', questionController.getQuestionById);

router.post('/', validate(create), deserializeMiddleware(QuestionDeserializer), questionController.createQuestion);

router.put('/:questionId', validate(update), deserializeMiddleware(QuestionDeserializer), questionController.updateQuestion);

router.delete('/:questionId', questionController.deleteQuestion);

module.exports = router;
