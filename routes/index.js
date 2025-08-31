const express = require('express');
const router = express.Router();

const categoryRoutes = require('./categories');
const sectionRoutes = require('./sections');
const questionRoutes = require('./questions');
//const { verifyToken } = require('../middleware/authMiddleware');
//router.use(verifyToken);


router.use('/categories', categoryRoutes);
router.use('/sections', sectionRoutes);
router.use('/questions', questionRoutes);

module.exports = router;