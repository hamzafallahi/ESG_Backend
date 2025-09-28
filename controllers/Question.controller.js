const db = require('../models');
const Question = db.question;
const Section = db.section;
const QuestionSerializer = require('../serializer/questionserializer.js');
const QuestionInlineSerializer = require('../serializer/Question.inline.serializer.js');
const { createCrudOperations } = require('../utils/crudOperations.js');
const NotFoundError = require('../error/exception/NotFound.js');
const BusinessError = require("../error/BusinessError");

const allowedFields = [
  "id",
  "section_id",
  "text",
  "text_fr",
  "score_value",
  "level",
  "created_at",
  "updated_at",
  "deleted_at",
];

const crudOps = createCrudOperations({
  Model: Question,
  modelName: "Question",
  Serializer: QuestionSerializer,
  InlineSerializer: QuestionInlineSerializer,
  allowedIncludes: ["section"],
  allowedFields,
  defaultIncludes: ["section"],
});

// CRUD operations for questions by section (with parent relationship)
const crudOpsBySection = createCrudOperations({
  Model: Question,
  modelName: "Question",
  Serializer: QuestionSerializer,
  InlineSerializer: QuestionInlineSerializer,
  allowedIncludes: ["section"],
  allowedFields,
  defaultIncludes: ["section"],
  parentIdField: "section_id",
});

// Custom getAll with pagination
const getAllQuestions = async (req, res, next) => {
  try {
    await crudOps.getAllWithPagination(req, res, next);
  } catch (error) {
    next(error);
  }
};

const getQuestionById = async (req, res, next) => {
  try {
    // Map questionId param to id for crudOps
    req.params.id = req.params.questionId;
    await crudOps.getById(req, res, next);
  } catch (error) {
    next(error);
  }
};

const getQuestionsBySection = async (req, res, next) => {
  try {
    // Map sectionId param to section_id for crudOps
    req.params.section_id = req.params.sectionId;
    await crudOpsBySection.getAllWithPagination(req, res, next);
  } catch (error) {
    next(error);
  }
};
const createQuestion = async (req, res, next) => {
  try {
    const { text, score_value, section_id } = req.body;
    const sectionIdFromRoute = req.params.sectionId;

    const businessError = new BusinessError(400, "Bad Request");
    
    // Use section_id from route if available, otherwise from body
    const finalSectionId = sectionIdFromRoute || section_id;
    
    // Check if section exists
    if (finalSectionId) {
      const section = await Section.findByPk(finalSectionId);
      if (!section) {
        businessError.addError("attributes.section_id", "Section does not exist");
      }
    }

    // Validate score_value
    if (score_value !== undefined && (score_value < 0 || !Number.isInteger(score_value))) {
      businessError.addError("attributes.score_value", "Score value must be a non-negative integer");
    }

    if (businessError.errors.length > 0) throw businessError;

    // Add section_id to request body for creation
    req.body.section_id = finalSectionId;

    const newQuestion = await Question.create(req.body);
    let serializedData = QuestionSerializer.serialize(newQuestion);
    res.status(201).json(serializedData);
  } catch (error) {
    next(error);
  }
};

const updateQuestion = async (req, res, next) => {
  try {
    const id = req.params.questionId;
    const update = await Question.findByPk(id);
    const businessError = new BusinessError(400, "Bad Request");
    
    if (!update) {
      throw new NotFoundError("Question not found", "Question");
    }

    // Validate score_value if being updated
    if (req.body.score_value !== undefined && (req.body.score_value < 0 || !Number.isInteger(req.body.score_value))) {
      businessError.addError("attributes.score_value", "Score value must be a non-negative integer");
    }

    if (businessError.errors.length > 0) throw businessError;

    await update.update(req.body);
    let serializedData = QuestionSerializer.serialize(update);
    res.json(serializedData);
  } catch (error) {
    next(error);
  }
};

const deleteQuestion = async (req, res, next) => {
  try {
    const id = req.params.questionId;
    const question = await Question.findByPk(id);
    
    if (!question) {
      throw new NotFoundError("Question not found", "Question");
    }

    await question.destroy();
    res.status(204).send(); 
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllQuestions,
  getQuestionById,
  getQuestionsBySection,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};
