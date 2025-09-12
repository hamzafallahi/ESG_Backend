const db = require('../models');
const ResultCategory = db.result_categories;
const ResultCategorySerializer = require("../serializer/ResultCategory.serializer.js");
const ResultCategoryInlineSerializer = require("../serializer/ResultCategory.inline.serializer.js");
const { createCrudOperations } = require( "../utils/crudOperations.js");
const NotFoundError = require( "../error/exception/NotFound.js");

const allowedFields = [
  "id",
  "result_id",
  "category_id",
  "score",
  "level",
  "created_at",
  "updated_at",
  "deleted_at",
];

const crudOps = createCrudOperations({
  Model: ResultCategory,
  modelName: "ResultCategory",
  Serializer: ResultCategorySerializer,
  InlineSerializer: ResultCategoryInlineSerializer,
  allowedIncludes: ["category", "results"],
  allowedFields,
  defaultIncludes: ["category", "results"],
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
    console.error(error);
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const newResultCategory = await ResultCategory.create(req.body);
    let serializedData = ResultCategorySerializer.serialize(newResultCategory);
    res.status(201).json(serializedData);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resultCategory = await ResultCategory.findByPk(id);

    if (!resultCategory) {
      throw new NotFoundError("ResultCategory not found", "ResultCategory");
    }

    await resultCategory.update(req.body);
    let serializedData = ResultCategorySerializer.serialize(resultCategory);
    res.json(serializedData);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resultCategory = await ResultCategory.findByPk(id);

    if (!resultCategory) {
      throw new NotFoundError("ResultCategory not found", "ResultCategory");
    }

    await resultCategory.destroy();
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
