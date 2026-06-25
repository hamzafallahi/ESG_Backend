const express = require('express');
const router = express.Router();
const rsciController = require('../controllers/Rsci.controller');
const { create, update, getAll } = require('../validation/Rsci.rules.js');
const RsciDeserializer = require('../deserializer/rscideserializer.js');
const deserializeMiddleware = require('../middleware/deserializeMiddleware');
const validate = require('../middleware/validationMiddleware');
const { requireAdmin } = require('../middleware/authMiddleware');

router.get('/', validate(getAll), rsciController.getAllRscis);
router.get('/:rsciId', rsciController.getRsciById);
router.post('/', requireAdmin, validate(create), deserializeMiddleware(RsciDeserializer), rsciController.createRsci);
router.patch('/:rsciId', requireAdmin, validate(update), deserializeMiddleware(RsciDeserializer), rsciController.updateRsci);
router.delete('/:rsciId', requireAdmin, rsciController.deleteRsci);

module.exports = router;
