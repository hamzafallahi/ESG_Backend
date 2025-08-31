const express = require('express');
const router = express.Router();
const sectionController = require('../controllers/Section.controller');
const questionController = require('../controllers/Question.controller');
const { create, update, getAll }  = require('../validation/Sections.rules.js');
const { create: createQuestion, getAll: getAllQuestions }  = require('../validation/Questions.rules.js');
const SectionDeserializer = require('../deserializer/sectiondeserializer.js');
const QuestionDeserializer = require('../deserializer/questiondeserializer.js');
const deserializeMiddleware = require('../middleware/deserializeMiddleware');
const validate = require('../middleware/validationMiddleware');
//const cacheMiddleware = require('../middleware/cache.middleware');

//router.use(cacheMiddleware);

router.get('/', validate(getAll), sectionController.getAllSections);

router.post('/', validate(create), deserializeMiddleware(SectionDeserializer), sectionController.createSection);

router.put('/:sectionId', validate(update), deserializeMiddleware(SectionDeserializer), sectionController.updateSection);

router.delete('/:sectionId', sectionController.deleteSection);

// Nested routes for questions under sections
router.get('/:sectionId/questions', validate(getAllQuestions), questionController.getQuestionsBySection);

router.post('/:sectionId/questions', validate(createQuestion), deserializeMiddleware(QuestionDeserializer), questionController.createQuestion);

module.exports = router;
