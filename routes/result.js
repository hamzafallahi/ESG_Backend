const express = require('express');
const resultController = require('../controllers/result.controller.js');
const { create, update, getAll } = require('../validation/Result.rules.js');
const ResultDeserializer = require('../deserializer/ResultDeserializer.js');
const deserializeMiddleware = require('../middleware/deserializeMiddleware.js');
const validate = require('../middleware/validationMiddleware.js');

const router = express.Router();

router.get('/', 
  
  validate(getAll), 
  resultController.getAll
);

router.get('/:id', 
  
  resultController.getById
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
