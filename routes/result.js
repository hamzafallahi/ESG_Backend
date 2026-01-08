const express = require('express');
const resultController = require('../controllers/result.controller.js');
const { create, update, getAll } = require('../validation/Result.rules.js');
const ResultDeserializer = require('../deserializer/ResultDeserializer.js');
const deserializeMiddleware = require('../middleware/deserializeMiddleware.js');
const validate = require('../middleware/validationMiddleware.js');
const { requireAdmin } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.get('/', 
  
  validate(getAll), 
  resultController.getAll
);

router.get('/:id', 
  
  resultController.getById
);

// Get assessment details for a specific result (admin/super admin only)
router.get('/:id/assessment-details', 
  requireAdmin,
  resultController.getAssessmentDetails
);

router.post('/', 
  
  validate(create), 
  deserializeMiddleware(ResultDeserializer), 
  resultController.create
);

router.patch('/:id', 
  
  validate(update), 
  deserializeMiddleware(ResultDeserializer), 
  resultController.update
);

router.delete('/:id', 
  
  resultController.remove
);

module.exports = router;
