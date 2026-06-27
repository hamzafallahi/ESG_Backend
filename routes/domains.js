const express = require('express');
const router = express.Router();
const domainController = require('../controllers/Domain.controller');
const { getAll } = require('../validation/Domain.rules.js');
const validate = require('../middleware/validationMiddleware');

// Domains are structural reference data (the 19 ESG domain codes) and are
// exposed read-only.
router.get('/', validate(getAll), domainController.getAllDomains);
router.get('/:domainId', domainController.getDomainById);

module.exports = router;
