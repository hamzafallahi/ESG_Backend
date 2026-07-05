const db = require('../models');
const Result = db.results;
const ResultCategory = db.result_categories;
const ResultSection = db.result_sections;
const AssessmentProgress = db.assessment_progress;
const Category = db.category;
const Section = db.section;
const User = db.user;
const ResultSerializer = require( "../serializer/Result.serializer.js");
const ResultInlineSerializer = require( "../serializer/Result.inline.serializer.js");
const { createCrudOperations } = require( "../utils/crudOperations.js");
const NotFoundError = require( "../error/exception/NotFound.js");
const BusinessError = require("../error/BusinessError");
const resultService = require('../services/resultService');
const { calculateAllScoresAndLevels } = require('../services/levelCalculationService');
const {
  composeAnswers,
  syncAnswers,
  computeMetrics,
} = require('../helper/progressAnswersHelper.js');

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

    // answers format: { questionId: { type: 'YES'|'NN'|'NA'|'NAC', nac_percentage?: number, justification?: {...} } }
    let answers = req.body.answers || {};

    // The user's current DRAFT progress (created lazily if missing) — it is
    // the canonical source of in-progress answers and will be linked to the
    // result on submission (status -> SUBMITTED, result_id set by the hook).
    let progress = await AssessmentProgress.findOne({
      where: { user_id: userId, status: 'DRAFT' },
    });

    if (Object.keys(answers).length === 0 && progress) {
      answers = await composeAnswers(progress.id);
    }
    const globalFeedback = req.body.global_feedback || null;

    // Calculate all scores (percentages) and the global maturity level
    // server-side, weighted by the company's sub-sector.
    const {
      globalScore,
      globalLevel,
      coreScore,
      categoryScores,
      subcategoryScores,
      unansweredCount,
      scoringSnapshot,
    } = await calculateAllScoresAndLevels(answers, user.sub_sector);

    // All questions must be answered before submission
    if (unansweredCount > 0) {
      const businessError = new BusinessError(400, "Bad Request");
      businessError.addError(
        'attributes.answers',
        `${unansweredCount} question(s) have not been answered. All questions must be answered before submission.`
      );
      throw businessError;
    }

    // Make sure the DRAFT progress reflects exactly the submitted answers so
    // the normalized rows linked to this result are accurate.
    if (!progress) {
      progress = await AssessmentProgress.create({
        user_id: userId,
        status: 'DRAFT',
      });
    }

    const answeredCount = await syncAnswers(progress, answers);
    const totalQuestions = progress.total_questions > 0 ? progress.total_questions : answeredCount;
    await progress.update({
      total_questions: totalQuestions,
      ...computeMetrics(answeredCount, totalQuestions),
      started_at: progress.started_at || new Date(),
    });

    // Create the main result record (afterCreate hook marks the progress
    // SUBMITTED and sets its result_id)
    const newResult = await Result.create({
      user_id: userId,
      total_score: globalScore,
      global_level: globalLevel,
      core_score: coreScore,
      global_feedback: globalFeedback,
      current_rank: null,
      scoring_snapshot: scoringSnapshot,
    });

    // Fetch category and section mappings for creating sub-records
    const [allCategories, allSections] = await Promise.all([
      Category.findAll({ attributes: ['id', 'name', 'name_fr'] }),
      Section.findAll({ attributes: ['id', 'title', 'title_fr'] }),
    ]);

    const categoryNameToId = {};
    allCategories.forEach(cat => {
      categoryNameToId[cat.name] = cat.id;
      if (cat.name_fr) categoryNameToId[cat.name_fr] = cat.id;
    });

    const sectionTitleToId = {};
    allSections.forEach(sec => {
      sectionTitleToId[sec.title] = sec.id;
      if (sec.title_fr) sectionTitleToId[sec.title_fr] = sec.id;
    });

    // Create result-category records — only English category names to avoid duplicates
    const seenCategoryIds = new Set();
    const categoryPromises = Object.entries(categoryScores)
      .map(([categoryName, score]) => {
        const categoryId = categoryNameToId[categoryName];
        if (!categoryId || seenCategoryIds.has(categoryId)) return null;
        seenCategoryIds.add(categoryId);
        return ResultCategory.create({
          result_id: newResult.id,
          category_id: categoryId,
          score,
        });
      });

    await Promise.all(categoryPromises.filter(Boolean));

    // Create result-section records — deduplicate by section id
    const seenSectionIds = new Set();
    const sectionPromises = [];
    Object.entries(subcategoryScores).forEach(([, subcategories]) => {
      Object.entries(subcategories).forEach(([sectionName, score]) => {
        const sectionId = sectionTitleToId[sectionName];
        if (!sectionId || seenSectionIds.has(sectionId)) return;
        seenSectionIds.add(sectionId);
        sectionPromises.push(
          ResultSection.create({
            result_id: newResult.id,
            section_id: sectionId,
            score,
          })
        );
      });
    });

    await Promise.all(sectionPromises);

    const serializedData = ResultSerializer.serialize(newResult);

    // Send email and save to Google Sheets asynchronously (non-blocking)
    resultService.sendResultNotification(newResult)
      .then(result => {
        console.log('Result notification sent:', result);
      })
      .catch(error => {
        console.error('Error sending result notification:', error);
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

    const assessmentDetails = result.assessment_details || {};

    // Answers come from the normalized rows of the submitted progress linked
    // to this result; legacy results fall back to the JSONB snapshot.
    let answers = assessmentDetails.answers || {};
    const progress = await AssessmentProgress.findOne({
      where: { result_id: id },
    });

    if (progress) {
      answers = await composeAnswers(progress.id);
    }

    const serializedData = {
      data: {
        type: 'assessment_details',
        id: result.id,
        attributes: {
          result_id: result.id,
          user_id: result.user_id,
          answers,
          current_page: progress ? progress.current_page : (assessmentDetails.current_page || 0),
          ui_state: progress ? progress.ui_state : (assessmentDetails.ui_state || {}),
          total_questions: progress ? progress.total_questions : (assessmentDetails.total_questions || 0),
          answered_questions: progress ? progress.answered_questions : (assessmentDetails.answered_questions || 0),
          completion_percentage: progress
            ? parseFloat(progress.completion_percentage)
            : (assessmentDetails.completion_percentage || 0),
          started_at: progress ? progress.started_at : (assessmentDetails.started_at || null),
          saved_at: assessmentDetails.saved_at || (progress ? progress.updated_at : null),
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
