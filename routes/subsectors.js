const express = require('express');
const router = express.Router();
const subSectorController = require('../controllers/SubSector.controller');
const { create, update, getAll, setWeights } = require('../validation/SubSector.rules.js');
const SubSectorDeserializer = require('../deserializer/subsectordeserializer.js');
const SubsectorWeightDeserializer = require('../deserializer/SubsectorWeight.deserializer.js');
const deserializeMiddleware = require('../middleware/deserializeMiddleware');
const validate = require('../middleware/validationMiddleware');
const { requireAdmin } = require('../middleware/authMiddleware');

router.get('/', validate(getAll), subSectorController.getAllSubSectors);
router.get('/:subSectorId', subSectorController.getSubSectorById);
router.post('/', requireAdmin, validate(create), deserializeMiddleware(SubSectorDeserializer), subSectorController.createSubSector);
router.patch('/:subSectorId', requireAdmin, validate(update), deserializeMiddleware(SubSectorDeserializer), subSectorController.updateSubSector);
router.delete('/:subSectorId', requireAdmin, subSectorController.deleteSubSector);

// Per-domain weight management for a sub-sector.
router.get('/:subSectorId/weights', subSectorController.getSubSectorWeights);
router.patch('/:subSectorId/weights', requireAdmin, validate(setWeights), deserializeMiddleware(SubsectorWeightDeserializer), subSectorController.setSubSectorWeights);

module.exports = router;
