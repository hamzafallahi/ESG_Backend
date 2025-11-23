const db = require('../models');
const Recommendation = db.recommendations;
const Category = db.category;
const Result = db.results;
const ResultCategory = db.result_categories;
const RecommendationSerializer = require('../serializer/recommendationserializer.js');
const RecommendationInlineSerializer = require('../serializer/Recommendation.inline.serializer.js');
const { createCrudOperations } = require('../utils/crudOperations.js');
const NotFoundError = require('../error/exception/NotFound.js');
const BusinessError = require('../error/BusinessError');

const allowedFields = [
  'id',
  'category_id',
  'level',
  'name',
  'name_fr',
  'image',
  'created_at',
  'updated_at',
  'deleted_at'
];

const crudOps = createCrudOperations({
  Model: Recommendation,
  modelName: 'Recommendation',
  Serializer: RecommendationSerializer,
  InlineSerializer: RecommendationInlineSerializer,
  allowedIncludes: ['category'],
  allowedFields,
  defaultIncludes: ['category']
});

// GET /recommendations
const getAllRecommendations = async (req, res, next) => {
  try {
    await crudOps.getAllWithPagination(req, res, next);
  } catch (error) {
    next(error);
  }
};

// GET /recommendations/:recommendationId
const getRecommendationById = async (req, res, next) => {
  try {
    req.params.id = req.params.recommendationId;
    await crudOps.getById(req, res, next);
  } catch (error) {
    next(error);
  }
};

// POST /recommendations
const createRecommendation = async (req, res, next) => {
  try {
    const { category_id, level, name } = req.body;
    const businessError = new BusinessError(400, 'BAD_REQUEST', 'Validation error');

    // Ensure category exists
    if (category_id) {
      const category = await Category.findByPk(category_id);
      if (!category) {
        businessError.addError('attributes.category_id', 'Category does not exist');
      }
    }

    // Unique constraint: one recommendation per (category_id, level)
    if (category_id && level !== undefined) {
      const existing = await Recommendation.findOne({ where: { category_id, level } });
      if (existing) {
        businessError.addError('attributes.level', 'Recommendation for this category and level already exists');
      }
    }

    // Optional uniqueness of name within category
    if (category_id && name) {
      const existingName = await Recommendation.findOne({ where: { category_id, name } });
      if (existingName) {
        businessError.addError('attributes.name', 'Name already used in this category');
      }
    }

    if (businessError.errors.length > 0) throw businessError;

    await crudOps.create(req, res, next);
  } catch (error) {
    next(error);
  }
};

// PATCH /recommendations/:recommendationId
const updateRecommendation = async (req, res, next) => {
  try {
    const id = req.params.recommendationId;
    const recommendation = await Recommendation.findByPk(id);
    if (!recommendation) {
      throw new NotFoundError('Recommendation not found', 'Recommendation');
    }
    const businessError = new BusinessError(400, 'BAD_REQUEST', 'Validation error');

    const { category_id, level, name } = req.body;

    const targetCategoryId = category_id || recommendation.category_id;
    const targetLevel = level !== undefined ? level : recommendation.level;

    // Validate category if changed
    if (category_id && category_id !== recommendation.category_id) {
      const category = await Category.findByPk(category_id);
      if (!category) {
        businessError.addError('attributes.category_id', 'Category does not exist');
      }
    }

    // Check (category_id, level) uniqueness if changed
    if (targetCategoryId && targetLevel !== undefined && (targetCategoryId !== recommendation.category_id || targetLevel !== recommendation.level)) {
      const existing = await Recommendation.findOne({ where: { category_id: targetCategoryId, level: targetLevel } });
      if (existing && existing.id !== id) {
        businessError.addError('attributes.level', 'Recommendation for this category and level already exists');
      }
    }

    // Name uniqueness within category if changed
    if (name && name !== recommendation.name) {
      const existingName = await Recommendation.findOne({ where: { category_id: targetCategoryId, name } });
      if (existingName && existingName.id !== id) {
        businessError.addError('attributes.name', 'Name already used in this category');
      }
    }

    if (businessError.errors.length > 0) throw businessError;

    req.params.id = id; // map for crudOps
    await crudOps.update(req, res, next);
  } catch (error) {
    next(error);
  }
};

// DELETE /recommendations/:recommendationId
const deleteRecommendation = async (req, res, next) => {
  try {
    const id = req.params.recommendationId;
    const recommendation = await Recommendation.findByPk(id);
    if (!recommendation) {
      throw new NotFoundError('Recommendation not found', 'Recommendation');
    }
    req.params.id = id; // map for crudOps
    await crudOps.remove(req, res, next);
  } catch (error) {
    next(error);
  }
};

// GET /recommendations/by-result/:resultId
const getRecommendationsByResult = async (req, res, next) => {
  try {
    const { resultId } = req.params;

    // 1. Fetch the result
    const result = await Result.findByPk(resultId);
    if (!result) {
      throw new NotFoundError('Result not found', 'Result');
    }

    // 2. Fetch all result_categories for this result
    const resultCategories = await ResultCategory.findAll({
      where: { result_id: resultId },
      attributes: ['category_id', 'level']
    });

    if (!resultCategories || resultCategories.length === 0) {
      // No categories, return empty recommendations
      return res.json({
        data: [],
        meta: {
          result_id: resultId,
          message: 'No result categories found for this result'
        }
      });
    }

    // 3. For each result_category, find recommendations where:
    //    - category_id matches
    //    - recommendation.level >= result_category.level (higher levels for improvement)
    const recommendations = [];
    const { Op } = require('sequelize');
    for (const resultCat of resultCategories) {
      const recs = await Recommendation.findAll({
        where: {
          category_id: resultCat.category_id,
          level: { [Op.gt]: resultCat.level } // Recommendations for levels greater than current
        },
        include: [{
          association: 'category',
          attributes: ['id', 'name', 'name_fr']
        }]
      });
      recommendations.push(...recs);
    }

    // 4. Serialize and return
    if (recommendations.length === 0) {
      return res.json({
        data: [],
        meta: {
          result_id: resultId,
          message: 'No recommendations found for the result categories and levels'
        }
      });
    }

    // Convert to plain objects and serialize
    const recsData = recommendations.map(r => r.toJSON ? r.toJSON() : r);
    const serialized = RecommendationSerializer.serialize(recsData);
    serialized.meta = {
      result_id: resultId,
      total_recommendations: recommendations.length
    };

    res.json(serialized);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRecommendations,
  getRecommendationById,
  createRecommendation,
  updateRecommendation,
  deleteRecommendation,
  getRecommendationsByResult,
};
