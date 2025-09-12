const db = require('../models');
const ResultSection = db.result_sections;
const ResultSectionSerializer = require( "../serializer/ResultSection.serializer.js");
const ResultSectionInlineSerializer = require( "../serializer/ResultSection.inline.serializer.js");
const { createCrudOperations } = require( "../utils/crudOperations.js");
const NotFoundError = require( "../error/exception/NotFound.js");

const allowedFields = [
  "id",
  "result_id",
  "section_id",
  "score",
  "level",
  "created_at",
  "updated_at",
  "deleted_at",
];

const crudOps = createCrudOperations({
  Model: ResultSection,
  modelName: "ResultSection",
  Serializer: ResultSectionSerializer,
  InlineSerializer: ResultSectionInlineSerializer,
  allowedIncludes: ["section","results"],
  allowedFields,
  defaultIncludes: ["section","results"],
});

// Custom getAll with pagination
const getAll = async (req, res, next) => {
  try {
    await crudOps.getAllWithPagination(req, res, next);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    await crudOps.getById(req, res, next);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const newResultSection = await ResultSection.create(req.body);
    let serializedData = ResultSectionSerializer.serialize(newResultSection);
    res.status(201).json(serializedData);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resultSection = await ResultSection.findByPk(id);

    if (!resultSection) {
      throw new NotFoundError("ResultSection not found", "ResultSection");
    }

    await resultSection.update(req.body);
    let serializedData = ResultSectionSerializer.serialize(resultSection);
    res.json(serializedData);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resultSection = await ResultSection.findByPk(id);

    if (!resultSection) {
      throw new NotFoundError("ResultSection not found", "ResultSection");
    }

    await resultSection.destroy();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
