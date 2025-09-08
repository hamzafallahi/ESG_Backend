const db = require('../models');
const Result = db.results;
const ResultSerializer = require( "../serializer/Result.serializer.js");
const ResultInlineSerializer = require( "../serializer/Result.inline.serializer.js");
const { createCrudOperations } = require( "../utils/crudOperations.js");
const NotFoundError = require( "../error/exception/NotFound.js");

const allowedFields = [
  "id",
  "user_id",
  "total_score",
  "global_feedback",
  "current_rank",
  "created_at",
  "updated_at",
  "deleted_at",
];

const crudOps = createCrudOperations({
  Model: Result,
  modelName: "Result",
  Serializer: ResultSerializer,
  InlineSerializer: ResultInlineSerializer,
  allowedIncludes: ["result_categories", "result_sections"],
  allowedFields,
  defaultIncludes: [],
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
    const { id } = req.params;
    const result = await Result.findByPk(id);

    if (!result) {
      throw new NotFoundError("Result not found", "Result");
    }

    let serializedData = ResultSerializer.serialize(result);
    res.json(serializedData);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const newResult = await Result.create(req.body);
    let serializedData = ResultSerializer.serialize(newResult);
    res.status(201).json(serializedData);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await Result.findByPk(id);

    if (!result) {
      throw new NotFoundError("Result not found", "Result");
    }

    await result.update(req.body);
    let serializedData = ResultSerializer.serialize(result);
    res.json(serializedData);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await Result.findByPk(id);

    if (!result) {
      throw new NotFoundError("Result not found", "Result");
    }

    await result.destroy();
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
