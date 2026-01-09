const db = require('../models');
const Result = db.results;
const User = db.user;
const ResultSerializer = require( "../serializer/Result.serializer.js");
const ResultInlineSerializer = require( "../serializer/Result.inline.serializer.js");
const { createCrudOperations } = require( "../utils/crudOperations.js");
const NotFoundError = require( "../error/exception/NotFound.js");
const BusinessError = require("../error/BusinessError");
const resultService = require('../services/resultService');

const allowedFields = [
  "id",
  "user_id",
  "total_score",
  "global_feedback",
  "current_rank",
  "assessment_details",
  "created_at",
  "updated_at",
  "deleted_at",
];

const crudOps = createCrudOperations({
  Model: Result,
  modelName: "Result",
  Serializer: ResultSerializer,
  InlineSerializer: ResultInlineSerializer,
  allowedIncludes: ["result_categories", "result_sections"],
  allowedFields,
  defaultIncludes: ["result_categories", "result_sections"],
});

// Custom getAll with pagination
const getAll = async (req, res, next) => {
  try {
    await crudOps.getAllWithPagination(req, res, next);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    await crudOps.getById(req, res, next);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const userId = req.body.user_id;
    
    // Validate user exists and check next_allowed_assessment_date
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new NotFoundError("User not found", "User");
    }
    
    // Check if user is allowed to submit a result
    if (user.next_allowed_assessment_date !== null) {
      const currentDate = new Date();
      const nextAllowedDate = new Date(user.next_allowed_assessment_date);
      
      if (currentDate < nextAllowedDate) {
        const businessError = new BusinessError(403, "Forbidden");
        businessError.addError(
          'attributes.user_id', 
          `You are not allowed to submit a result until ${nextAllowedDate.toISOString()}`
        );
        throw businessError;
      }
    }
    
    const newResult = await Result.create(req.body);
    let serializedData = ResultSerializer.serialize(newResult);
    
    // Send email and save to Google Sheets asynchronously (non-blocking)
    // This runs in the background so the response is sent immediately
    resultService.sendResultNotification(newResult)
      .then(result => {
        console.log('Result notification sent:', result);
      })
      .catch(error => {
        console.error('Error sending result notification:', error);
        // Don't fail the request if email/sheets fail
      });
    
    res.status(201).json(serializedData);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await Result.findByPk(id);

    if (!result) {
      throw new NotFoundError("Result not found", "Result");
    }

    await result.update(req.body);
    let serializedData = ResultSerializer.serialize(result);
    res.json(serializedData);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await Result.findByPk(id);

    if (!result) {
      throw new NotFoundError("Result not found", "Result");
    }

    await result.destroy();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Get assessment details for a specific result (admin only)
const getAssessmentDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await Result.findByPk(id, {
      attributes: ['id', 'user_id', 'assessment_details', 'created_at']
    });

    if (!result) {
      throw new NotFoundError("Result not found", "Result");
    }

    // Serialize similar to AssessmentProgress serializer format
    const assessmentDetails = result.assessment_details || {};
    
    const serializedData = {
      data: {
        type: 'assessment_details',
        id: result.id,
        attributes: {
          result_id: result.id,
          user_id: result.user_id,
          answers: assessmentDetails.answers || {},
          current_page: assessmentDetails.current_page || 0,
          ui_state: assessmentDetails.ui_state || {},
          total_questions: assessmentDetails.total_questions || 0,
          answered_questions: assessmentDetails.answered_questions || 0,
          completion_percentage: assessmentDetails.completion_percentage || 0,
          saved_at: assessmentDetails.saved_at || null,
          result_created_at: result.created_at
        }
      }
    };

    res.json(serializedData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  getAssessmentDetails,
};
