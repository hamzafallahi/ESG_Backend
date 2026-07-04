const db = require('../models');
const AssessmentProgress = db.assessment_progress;
const AssessmentProgressSerializer = require('../serializer/AssessmentProgress.serializer.js');
const AssessmentProgressInlineSerializer = require('../serializer/AssessmentProgress.inline.serializer.js');
const { createCrudOperations } = require('../utils/crudOperations.js');
const NotFoundError = require('../error/exception/NotFound.js');
const BusinessError = require('../error/BusinessError');

const allowedFields = [
  "id",
  "user_id",
  "answers",
  "current_page",
  "ui_state",
  "total_questions",
  "answered_questions",
  "completion_percentage",
  "started_at",
  "created_at",
  "updated_at",
];

const crudOps = createCrudOperations({
  Model: AssessmentProgress,
  modelName: "AssessmentProgress",
  Serializer: AssessmentProgressSerializer,
  InlineSerializer: AssessmentProgressInlineSerializer,
  allowedIncludes: ["user"],
  allowedFields,
  defaultIncludes: [],
});

// Get all assessment progress records with pagination
const getAll = async (req, res, next) => {
  try {
    await crudOps.getAllWithPagination(req, res, next);
  } catch (error) {
    next(error);
  }
};

// Get assessment progress by ID
const getById = async (req, res, next) => {
  try {
    await crudOps.getById(req, res, next);
  } catch (error) {
    next(error);
  }
};

// Get assessment progress for the current logged-in user
const getCurrentUserProgress = async (req, res, next) => {
  try {
    const userId = req.userId; // From auth middleware

    let progress = await AssessmentProgress.findOne({
      where: { user_id: userId },
    });

    if (!progress) {
      progress = await AssessmentProgress.create({
        user_id: userId,
        answers: {},
        current_page: 0,
        ui_state: {},
        total_questions: 0,
        answered_questions: 0,
        completion_percentage: 0.00,
        started_at: null,
      });
    }

    const serializedData = AssessmentProgressSerializer.serialize(progress.toJSON());
    res.json(serializedData);
  } catch (error) {
    next(error);
  }
};

// Get assessment progress by user ID (admin use)
const getByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const progress = await AssessmentProgress.findOne({
      where: { user_id: userId },
    });

    if (!progress) {
      throw new NotFoundError('Assessment progress not found for this user', 'AssessmentProgress');
    }

    const serializedData = AssessmentProgressSerializer.serialize(progress.toJSON());
    res.json(serializedData);
  } catch (error) {
    next(error);
  }
};

// Create assessment progress (typically done automatically on user signup)
const create = async (req, res, next) => {
  try {
    const businessError = new BusinessError(400, "Bad Request");

    // Check if progress already exists for this user
    if (req.body.user_id) {
      const existingProgress = await AssessmentProgress.findOne({
        where: { user_id: req.body.user_id }
      });

      if (existingProgress) {
        businessError.addError('attributes.user_id', 'Assessment progress already exists for this user');
      }
    }

    if (businessError.errors.length > 0) throw businessError;

    await crudOps.create(req, res, next);
  } catch (error) {
    next(error);
  }
};

// Update assessment progress (user updates their progress)
const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const progress = await AssessmentProgress.findByPk(id);

    if (!progress) {
      throw new NotFoundError('Assessment progress not found', 'AssessmentProgress');
    }

    // Prevent changing user_id
    if (req.body.user_id && req.body.user_id !== progress.user_id) {
      const businessError = new BusinessError(400, "Bad Request");
      businessError.addError('attributes.user_id', 'Cannot change user_id for assessment progress');
      throw businessError;
    }

    await progress.update(req.body);
    const serializedData = AssessmentProgressSerializer.serialize(progress.toJSON());
    res.json(serializedData);
  } catch (error) {
    next(error);
  }
};

// Update current user's assessment progress
const updateCurrentUserProgress = async (req, res, next) => {
  try {
    const userId = req.userId; // From auth middleware

    let progress = await AssessmentProgress.findOne({
      where: { user_id: userId }
    });

    if (!progress) {
      // Create if doesn't exist (shouldn't happen but handle it)
      progress = await AssessmentProgress.create({
        user_id: userId,
        answers: req.body.answers || {},
        current_page: req.body.current_page || 0,
        ui_state: req.body.ui_state || {},
        total_questions: req.body.total_questions || 0,
        started_at: req.body.answers && Object.keys(req.body.answers).length > 0 ? new Date() : null,
      });
    } else {
      // Prevent changing user_id
      delete req.body.user_id;
      
      // Set started_at when user first starts answering questions
      if (!progress.started_at && req.body.answers && Object.keys(req.body.answers).length > 0) {
        req.body.started_at = new Date();
      }
      
      await progress.update(req.body);
    }

    const serializedData = AssessmentProgressSerializer.serialize(progress.toJSON());
    res.json(serializedData);
  } catch (error) {
    next(error);
  }
};

// Delete assessment progress
const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const progress = await AssessmentProgress.findByPk(id);

    if (!progress) {
      throw new NotFoundError('Assessment progress not found', 'AssessmentProgress');
    }

    await progress.destroy();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Reset current user's assessment progress
const resetCurrentUserProgress = async (req, res, next) => {
  try {
    const userId = req.userId; // From auth middleware

    const progress = await AssessmentProgress.findOne({
      where: { user_id: userId }
    });

    if (!progress) {
      throw new NotFoundError('Assessment progress not found', 'AssessmentProgress');
    }

    // Reset to default values and set started_at to null
    await progress.update({
      answers: {},
      current_page: 0,
      ui_state: {},
      answered_questions: 0,
      completion_percentage: 0.00,
      started_at: null, // Reset to null - will be set when user starts new assessment
    });

    const serializedData = AssessmentProgressSerializer.serialize(progress.toJSON());
    res.json(serializedData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getById,
  getCurrentUserProgress,
  getByUserId,
  create,
  update,
  updateCurrentUserProgress,
  remove,
  resetCurrentUserProgress,
};
