const express = require('express');


// Import route modules
const resultRoutes = require('./result');
const resultCategoryRoutes = require('./resultCategory');
const resultSectionRoutes = require('./resultSection');
const categoryRoutes = require('./categories');
const sectionRoutes = require('./sections');
const questionRoutes = require('./questions');

const authRoutes = require('./auth');
const router = express.Router();

router.use('/results', resultRoutes);
router.use('/result-categories', resultCategoryRoutes);
router.use('/result-sections', resultSectionRoutes);
router.use('/categories', categoryRoutes);
router.use('/sections', sectionRoutes);
router.use('/questions', questionRoutes);
router.use('/auth', authRoutes);

module.exports = router;    