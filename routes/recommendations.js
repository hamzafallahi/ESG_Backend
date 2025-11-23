const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/Recommendation.controller');
const { create, update, getAll, delete: deleteValidation } = require('../validation/Recommendation.rules.js');
const RecommendationDeserializer = require('../deserializer/recommendationdeserializer.js');
const deserializeMiddleware = require('../middleware/deserializeMiddleware');
const validate = require('../middleware/validationMiddleware');
const { requireAdmin } = require('../middleware/authMiddleware');

// GET /recommendations
router.get('/', validate(getAll), recommendationController.getAllRecommendations);

// GET /recommendations/:recommendationId
router.get('/:recommendationId', recommendationController.getRecommendationById);

// POST /recommendations (admin only)
router.post('/', requireAdmin, validate(create), deserializeMiddleware(RecommendationDeserializer), recommendationController.createRecommendation);

// PATCH /recommendations/:recommendationId (admin only)
router.patch('/:recommendationId', requireAdmin, validate(update), deserializeMiddleware(RecommendationDeserializer), recommendationController.updateRecommendation);

// DELETE /recommendations/:recommendationId (admin only)
router.delete('/:recommendationId', requireAdmin, validate(deleteValidation), recommendationController.deleteRecommendation);

// GET /recommendations/by-result/:resultId
router.get('/by-result/:resultId', recommendationController.getRecommendationsByResult);

module.exports = router;
