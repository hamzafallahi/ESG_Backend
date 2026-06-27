const db = require('../models');
const Domain = db.domain;
const DomainSerializer = require('../serializer/domainserializer.js');
const DomainInlineSerializer = require('../serializer/Domain.inline.serializer.js');
const { createCrudOperations } = require('../utils/crudOperations.js');

const allowedFields = ["id", "code", "pillar", "label", "created_at", "updated_at"];

const crudOps = createCrudOperations({
  Model: Domain,
  modelName: "Domain",
  Serializer: DomainSerializer,
  InlineSerializer: DomainInlineSerializer,
  allowedIncludes: ["sections", "subsector_weights"],
  allowedFields,
  defaultIncludes: [],
});

const getAllDomains = async (req, res, next) => {
  try {
    await crudOps.getAllWithPagination(req, res, next);
  } catch (error) {
    next(error);
  }
};

const getDomainById = async (req, res, next) => {
  try {
    req.params.id = req.params.domainId;
    await crudOps.getById(req, res, next);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDomains,
  getDomainById,
};
