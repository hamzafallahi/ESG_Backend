const db = require('../models');
const SubSector = db.sub_sector;
const Section = db.section;
const Category = db.category;
const SubsectorWeight = db.subsector_weight;
const SubSectorSerializer = require('../serializer/subsectorserializer.js');
const SubSectorInlineSerializer = require('../serializer/SubSector.inline.serializer.js');
const { createCrudOperations } = require('../utils/crudOperations.js');
const NotFoundError = require('../error/exception/NotFound.js');
const BusinessError = require('../error/BusinessError');
const { clearWeightCache } = require('../services/weightConfigService');

const allowedFields = ["id", "code", "label", "label_fr", "active", "created_at", "updated_at"];

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
  try { await crudOps.getAllWithPagination(req, res, next); }
  catch (error) { next(error); }
};

const getSubSectorById = async (req, res, next) => {
  try {
    req.params.id = req.params.subSectorId;
    await crudOps.getById(req, res, next);
  } catch (error) { next(error); }
};

const createSubSector = async (req, res, next) => {
  try {
    const businessError = new BusinessError(400, "Bad Request");

    if (req.body.code) {
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
  } catch (error) { next(error); }
};

const updateSubSector = async (req, res, next) => {
  try {
    const id = req.params.subSectorId;
    const subSector = await SubSector.findByPk(id);
    if (!subSector) throw new NotFoundError("SubSector not found", "SubSector");

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
    clearWeightCache(previousCode);
    clearWeightCache(subSector.code);
    res.json(SubSectorSerializer.serialize(subSector));
  } catch (error) { next(error); }
};

const deleteSubSector = async (req, res, next) => {
  try {
    const id = req.params.subSectorId;
    const subSector = await SubSector.findByPk(id);
    if (!subSector) throw new NotFoundError("SubSector not found", "SubSector");

    const code = subSector.code;
    await subSector.destroy();
    clearWeightCache(code);
    res.status(204).send();
  } catch (error) { next(error); }
};

// Build the { sub_sector, weights[] } response for a sub-sector's weight set.
const buildWeightsResponse = async (subSector) => {
  const weights = await SubsectorWeight.findAll({
    where: { sub_sector_id: subSector.id },
    include: [{
      model: Section,
      as: 'section',
      attributes: ['id', 'title', 'title_fr', 'core', 'category_id'],
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'name_fr'] }],
    }],
  });

  return {
    data: {
      type: 'sub_sectors',
      id: subSector.id,
      attributes: {
        code: subSector.code,
        label: subSector.label,
        label_fr: subSector.label_fr,
        active: subSector.active,
      },
      weights: weights.map((w) => ({
        section_id: w.section_id,
        section_title: w.section?.title || null,
        section_title_fr: w.section?.title_fr || null,
        core: !!w.section?.core,
        category_id: w.section?.category_id || null,
        category_name: w.section?.category?.name || null,
        category_name_fr: w.section?.category?.name_fr || null,
        weight: Number(w.weight),
      })),
      total: weights.reduce((sum, w) => sum + Number(w.weight), 0),
    },
  };
};

const getSubSectorWeights = async (req, res, next) => {
  try {
    const subSector = await SubSector.findByPk(req.params.subSectorId);
    if (!subSector) throw new NotFoundError("SubSector not found", "SubSector");
    res.json(await buildWeightsResponse(subSector));
  } catch (error) { next(error); }
};

/**
 * Bulk (partial) set of per-section weights for a sub-sector. Only the section
 * ids present in the payload are created/updated; others are left untouched.
 * Payload: { data: { weights: { "<sectionId>": 39.9, ... } } }
 */
const setSubSectorWeights = async (req, res, next) => {
  try {
    const subSector = await SubSector.findByPk(req.params.subSectorId);
    if (!subSector) throw new NotFoundError("SubSector not found", "SubSector");

    const businessError = new BusinessError(400, "Bad Request");
    const { weights = {} } = req.body;
    const sectionIds = Object.keys(weights);

    if (sectionIds.length === 0) {
      businessError.addError("data.weights", "At least one weight is required");
      throw businessError;
    }

    for (const [id, value] of Object.entries(weights)) {
      if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
        businessError.addError(`data.weights.${id}`, "Weight must be a non-negative number");
      }
    }
    if (businessError.errors.length > 0) throw businessError;

    const foundSections = await Section.findAll({
      where: { id: sectionIds },
      attributes: ['id'],
    });
    const foundIds = new Set(foundSections.map((s) => s.id));
    const missing = sectionIds.filter((id) => !foundIds.has(id));
    if (missing.length > 0) {
      businessError.addError("data.weights", `Unknown section ids: ${missing.join(", ")}`);
      throw businessError;
    }

    await db.sequelize.transaction(async (t) => {
      for (const sectionId of sectionIds) {
        const [row, created] = await SubsectorWeight.findOrCreate({
          where: { sub_sector_id: subSector.id, section_id: sectionId },
          defaults: { weight: weights[sectionId] },
          transaction: t,
        });
        if (!created) {
          await row.update({ weight: weights[sectionId] }, { transaction: t });
        }
      }
    });

    clearWeightCache(subSector.code);
    res.json(await buildWeightsResponse(subSector));
  } catch (error) { next(error); }
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
