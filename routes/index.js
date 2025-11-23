const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');

// Import route modules
const resultRoutes = require('./result');
const resultCategoryRoutes = require('./resultCategory');
const resultSectionRoutes = require('./resultSection');
const categoryRoutes = require('./categories');
const sectionRoutes = require('./sections');
const questionRoutes = require('./questions');
const authRoutes = require('./auth');
const adminRoutes = require('./admins');
const userRoutes = require('./users');
const recommendationRoutes = require('./recommendations');
const router = express.Router();

// Public routes (no authentication required)
router.use('/auth', authRoutes);

// All routes below require authentication
router.use(authenticate);

router.use('/results', resultRoutes);
router.use('/result-categories', resultCategoryRoutes);
router.use('/result-sections', resultSectionRoutes);
router.use('/categories', categoryRoutes);
router.use('/sections', sectionRoutes);
router.use('/questions', questionRoutes);
router.use('/admins', adminRoutes);
router.use('/users', userRoutes);
router.use('/recommendations', recommendationRoutes);

module.exports = router;    