const express = require('express');
const resultSectionController = require('../controllers/resultSection.controller.js');
const { create, update, getAll } = require('../validation/ResultSection.rules.js');
const ResultSectionDeserializer = require('../deserializer/ResultSectionDeserializer.js');
const deserializeMiddleware = require('../middleware/deserializeMiddleware.js');
const validate = require('../middleware/validationMiddleware.js');
const router = express.Router();

router.get('/', 
  
  validate(getAll), 
  resultSectionController.getAll
);

router.get('/:id', 
  
  resultSectionController.getById
);

router.post('/', 
  
  validate(create), 
  deserializeMiddleware(ResultSectionDeserializer), 
  resultSectionController.create
);

router.patch('/:id', 
  
  validate(update), 
  deserializeMiddleware(ResultSectionDeserializer), 
  resultSectionController.update
);

router.delete('/:id', 
  
  resultSectionController.remove
);

module.exports = router;
