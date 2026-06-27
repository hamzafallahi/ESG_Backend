const db = require('../models');
const SubSector = db.sub_sector;
const Domain = db.domain;
const SubsectorWeight = db.subsector_weight;
const SubSectorSerializer = require('../serializer/subsectorserializer.js');
const SubSectorInlineSerializer = require('../serializer/SubSector.inline.serializer.js');
const { createCrudOperations } = require('../utils/crudOperations.js');
const NotFoundError = require('../error/exception/NotFound.js');
const BusinessError = require('../error/BusinessError');
const { clearWeightCache } = require('../services/weightConfigService');

const allowedFields = ["id", "code", "label", "active", "created_at", "updated_at"];

const crudOps = createCrudOperations({
  Model: SubSector,
  modelName: "SubSector",
  Serializer: SubSectorSerializer,
  InlineSerializer: SubSectorInlineSerializer,
  allowedIncludes: ["subsector_weights"],
  allowedFields,
  defaultIncludes: [],
});

const getAllSubSectors = async (req, res, next) => {
  try {
    await crudOps.getAllWithPagination(req, res, next);
  } catch (error) {
    next(error);
  }
};

const getSubSectorById = async (req, res, next) => {
  try {
    req.params.id = req.params.subSectorId;
    await crudOps.getById(req, res, next);
  } catch (error) {
    next(error);
  }
};

const createSubSector = async (req, res, next) => {
  try {
    const businessError = new BusinessError(400, "Bad Request");

    if (req.body.code) {
      // Codes are matched case-insensitively by the scoring engine.
      req.body.code = req.body.code.toUpperCase();
      const existing = await SubSector.findOne({ where: { code: req.body.code } });
      if (existing) {
        businessError.addError("attributes.code", "Sub-sector code already exists");
      }
    }

    if (businessError.errors.length > 0) throw businessError;

    const newSubSector = await SubSector.create(req.body);
    clearWeightCache(newSubSector.code);
    res.status(201).json(SubSectorSerializer.serialize(newSubSector));
  } catch (error) {
    next(error);
  }
};

const updateSubSector = async (req, res, next) => {
  try {
    const id = req.params.subSectorId;
    const subSector = await SubSector.findByPk(id);

    if (!subSector) {
      throw new NotFoundError("SubSector not found", "SubSector");
    }

    const businessError = new BusinessError(400, "Bad Request");
    const previousCode = subSector.code;

    if (req.body.code) {
      req.body.code = req.body.code.toUpperCase();
      if (req.body.code !== subSector.code) {
        const existing = await SubSector.findOne({ where: { code: req.body.code } });
        if (existing) {
          businessError.addError("attributes.code", "Sub-sector code already exists");
        }
      }
    }

    if (businessError.errors.length > 0) throw businessError;

    await subSector.update(req.body);
    // Evict both old and new code so scoring reflects the change immediately.
    clearWeightCache(previousCode);
    clearWeightCache(subSector.code);
    res.json(SubSectorSerializer.serialize(subSector));
  } catch (error) {
    next(error);
  }
};

const deleteSubSector = async (req, res, next) => {
  try {
    const id = req.params.subSectorId;
    const subSector = await SubSector.findByPk(id);

    if (!subSector) {
      throw new NotFoundError("SubSector not found", "SubSector");
    }

    const code = subSector.code;
    await subSector.destroy();
    clearWeightCache(code);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Build the { sub_sector, weights[] } response for a sub-sector's weight set.
const buildWeightsResponse = async (subSector) => {
  const weights = await SubsectorWeight.findAll({
    where: { sub_sector_id: subSector.id },
    include: [{ model: Domain, as: 'domain', attributes: ['id', 'code', 'pillar'] }],
  });

  return {
    data: {
      type: 'sub_sectors',
      id: subSector.id,
      attributes: {
        code: subSector.code,
        label: subSector.label,
        active: subSector.active,
      },
      weights: weights.map((w) => ({
        domain_id: w.domain_id,
        domain_code: w.domain?.code || null,
        pillar: w.domain?.pillar || null,
        weight: Number(w.weight),
      })),
      total: weights.reduce((sum, w) => sum + Number(w.weight), 0),
    },
  };
};

const getSubSectorWeights = async (req, res, next) => {
  try {
    const subSector = await SubSector.findByPk(req.params.subSectorId);
    if (!subSector) {
      throw new NotFoundError("SubSector not found", "SubSector");
    }
    res.json(await buildWeightsResponse(subSector));
  } catch (error) {
    next(error);
  }
};

// Bulk (partial) set of per-domain weights for a sub-sector. Only the domain
// codes present in the payload are created/updated; others are left untouched.
const setSubSectorWeights = async (req, res, next) => {
  try {
    const subSector = await SubSector.findByPk(req.params.subSectorId);
    if (!subSector) {
      throw new NotFoundError("SubSector not found", "SubSector");
    }

    const businessError = new BusinessError(400, "Bad Request");
    const { weights = {} } = req.body;

    const codes = Object.keys(weights);
    if (codes.length === 0) {
      businessError.addError("data.weights", "At least one weight is required");
      throw businessError;
    }

    for (const [code, value] of Object.entries(weights)) {
      if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
        businessError.addError(`data.weights.${code}`, "Weight must be a non-negative number");
      }
    }
    if (businessError.errors.length > 0) throw businessError;

    const domains = await Domain.findAll({ where: { code: codes } });
    const domainByCode = {};
    domains.forEach((d) => { domainByCode[d.code] = d; });

    const missing = codes.filter((c) => !domainByCode[c]);
    if (missing.length > 0) {
      businessError.addError("data.weights", `Unknown domain codes: ${missing.join(", ")}`);
      throw businessError;
    }

    await db.sequelize.transaction(async (t) => {
      for (const code of codes) {
        const domainId = domainByCode[code].id;
        const [row, created] = await SubsectorWeight.findOrCreate({
          where: { sub_sector_id: subSector.id, domain_id: domainId },
          defaults: { weight: weights[code] },
          transaction: t,
        });
        if (!created) {
          await row.update({ weight: weights[code] }, { transaction: t });
        }
      }
    });

    clearWeightCache(subSector.code);
    res.json(await buildWeightsResponse(subSector));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSubSectors,
  getSubSectorById,
  createSubSector,
  updateSubSector,
  deleteSubSector,
  getSubSectorWeights,
  setSubSectorWeights,
};
