const db = require('../models');
const AssessmentProgress = db.assessment_progress;
const AssessmentProgressSerializer = require('../serializer/AssessmentProgress.serializer.js');
const AssessmentProgressInlineSerializer = require('../serializer/AssessmentProgress.inline.serializer.js');
const { createCrudOperations } = require('../utils/crudOperations.js');
const NotFoundError = require('../error/exception/NotFound.js');
const BusinessError = require('../error/BusinessError');
const {
  composeAnswers,
  syncAnswers,
  computeMetrics,
} = require('../helper/progressAnswersHelper.js');

const allowedFields = [
  "id",
  "user_id",
  "status",
  "result_id",
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

// Fields clients are never allowed to set directly — the lifecycle is
// managed by the submission flow (see Result afterCreate hook).
const stripManagedFields = (body) => {
  const fields = { ...body };
  delete fields.status;
  delete fields.result_id;
  return fields;
};

// Serialize a progress instance with its normalized answers composed back
// into the legacy `answers` object shape.
const serializeWithAnswers = async (progress) => {
  const answers = await composeAnswers(progress.id);
  return AssessmentProgressSerializer.serialize({
    ...progress.toJSON(),
    answers,
  });
};

// Find the user's current DRAFT progress, creating one if needed.
const findOrCreateDraft = async (userId) => {
  let progress = await AssessmentProgress.findOne({
    where: { user_id: userId, status: 'DRAFT' },
  });

  if (!progress) {
    progress = await AssessmentProgress.create({
      user_id: userId,
      status: 'DRAFT',
      current_page: 0,
      ui_state: {},
      total_questions: 0,
      answered_questions: 0,
      completion_percentage: 0.00,
      started_at: null,
    });
  }

  return progress;
};

// Apply an update (fields + answers sync) to a progress record inside a transaction.
const applyProgressUpdate = async (progress, body) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { answers, ...rawFields } = stripManagedFields(body);
    const fields = { ...rawFields };
    delete fields.user_id;

    if (answers !== undefined) {
      const answeredCount = await syncAnswers(progress, answers, transaction);
      const total = fields.total_questions !== undefined
        ? fields.total_questions
        : progress.total_questions;

      Object.assign(fields, computeMetrics(answeredCount, total));

      // Set started_at when the user first starts answering questions
      if (!progress.started_at && answeredCount > 0) {
        fields.started_at = new Date();
      }
    }

    await progress.update(fields, { transaction });
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// Get all assessment progress records with pagination
const getAll = async (req, res, next) => {
  try {
    await crudOps.getAllWithPagination(req, res, next);
  } catch (error) {
    next(error);
  }
};

// Get assessment progress by ID (answers composed from normalized rows)
const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const progress = await AssessmentProgress.findByPk(id);

    if (!progress) {
      throw new NotFoundError('Assessment progress not found', 'AssessmentProgress');
    }

    res.json(await serializeWithAnswers(progress));
  } catch (error) {
    next(error);
  }
};

// Get assessment progress for the current logged-in user (their DRAFT)
const getCurrentUserProgress = async (req, res, next) => {
  try {
    const userId = req.userId; // From auth middleware
    const progress = await findOrCreateDraft(userId);
    res.json(await serializeWithAnswers(progress));
  } catch (error) {
    next(error);
  }
};

// Get assessment progress by user ID (admin use) — current DRAFT first,
// falling back to the most recent submitted attempt.
const getByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;

    let progress = await AssessmentProgress.findOne({
      where: { user_id: userId, status: 'DRAFT' },
    });

    if (!progress) {
      progress = await AssessmentProgress.findOne({
        where: { user_id: userId },
        order: [['updated_at', 'DESC']],
      });
    }

    if (!progress) {
      throw new NotFoundError('Assessment progress not found for this user', 'AssessmentProgress');
    }

    res.json(await serializeWithAnswers(progress));
  } catch (error) {
    next(error);
  }
};

// Create assessment progress (typically done automatically on user signup)
const create = async (req, res, next) => {
  try {
    const businessError = new BusinessError(400, "Bad Request");
    const { answers, ...rawFields } = stripManagedFields(req.body);

    if (!rawFields.user_id) {
      businessError.addError('attributes.user_id', 'user_id is required');
      throw businessError;
    }

    // A user can only have one DRAFT progress at a time
    const existingDraft = await AssessmentProgress.findOne({
      where: { user_id: rawFields.user_id, status: 'DRAFT' }
    });

    if (existingDraft) {
      businessError.addError('attributes.user_id', 'A draft assessment progress already exists for this user');
      throw businessError;
    }

    const progress = await AssessmentProgress.create({
      ...rawFields,
      status: 'DRAFT',
    });

    if (answers !== undefined && Object.keys(answers).length > 0) {
      await applyProgressUpdate(progress, { answers });
    }

    res.status(201).json(await serializeWithAnswers(progress));
  } catch (error) {
    next(error);
  }
};

// Update assessment progress (admin, by id)
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

    await applyProgressUpdate(progress, req.body);
    res.json(await serializeWithAnswers(progress));
  } catch (error) {
    next(error);
  }
};

// Update current user's assessment progress (their DRAFT)
const updateCurrentUserProgress = async (req, res, next) => {
  try {
    const userId = req.userId; // From auth middleware
    const progress = await findOrCreateDraft(userId);

    await applyProgressUpdate(progress, req.body);
    res.json(await serializeWithAnswers(progress));
  } catch (error) {
    next(error);
  }
};

// Delete assessment progress (normalized answers cascade)
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

// Reset current user's assessment progress (clears the DRAFT)
const resetCurrentUserProgress = async (req, res, next) => {
  try {
    const userId = req.userId; // From auth middleware
    const progress = await findOrCreateDraft(userId);

    const transaction = await db.sequelize.transaction();
    try {
      await db.assessment_progress_answer.destroy({
        where: { assessment_progress_id: progress.id },
        transaction,
      });

      await progress.update({
        current_page: 0,
        ui_state: {},
        answered_questions: 0,
        completion_percentage: 0.00,
        started_at: null, // Reset to null - will be set when user starts new assessment
      }, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    res.json(await serializeWithAnswers(progress));
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
