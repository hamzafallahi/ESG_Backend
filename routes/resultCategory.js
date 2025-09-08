const express = require('express');
const resultCategoryController = require('../controllers/resultCategory.controller.js');
const { create, update, getAll } = require('../validation/ResultCategory.rules.js');
const ResultCategoryDeserializer = require('../deserializer/ResultCategoryDeserializer.js');
const deserializeMiddleware = require('../middleware/deserializeMiddleware.js');
const validate = require('../middleware/validationMiddleware.js');
const router = express.Router();

router.get('/', 
  
  validate(getAll), 
  resultCategoryController.getAll
);

router.get('/:id', 
  
  resultCategoryController.getById
);

router.post('/', 
  
  validate(create), 
  deserializeMiddleware(ResultCategoryDeserializer), 
  resultCategoryController.create
);

router.patch('/:id', 
  
  validate(update), 
  deserializeMiddleware(ResultCategoryDeserializer), 
  resultCategoryController.update
);

router.delete('/:id', 
  
  resultCategoryController.remove
);

module.exports = router;
