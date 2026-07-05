const express = require('express');
const router = express.Router();
const resultsIntroductionController = require('../controllers/ResultsIntroduction.controller');
const { update } = require('../validation/ResultsIntroduction.rules');
const validate = require('../middleware/validationMiddleware');
const { requireAdmin } = require('../middleware/authMiddleware');

router.get('/', resultsIntroductionController.getResultsIntroduction);
router.patch('/', requireAdmin, validate(update), resultsIntroductionController.updateResultsIntroduction);

module.exports = router;
