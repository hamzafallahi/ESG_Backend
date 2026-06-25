const db = require('../models');
const Rsci = db.rsci;
const RsciSerializer = require('../serializer/rsciserializer.js');
const RsciInlineSerializer = require('../serializer/Rsci.inline.serializer.js');
const { createCrudOperations } = require('../utils/crudOperations.js');
const NotFoundError = require('../error/exception/NotFound.js');
const BusinessError = require('../error/BusinessError');

const allowedFields = ["id", "code", "title", "created_at", "updated_at"];

const crudOps = createCrudOperations({
  Model: Rsci,
  modelName: "Rsci",
  Serializer: RsciSerializer,
  InlineSerializer: RsciInlineSerializer,
  allowedIncludes: ["questions"],
  allowedFields,
  defaultIncludes: [],
});

const getAllRscis = async (req, res, next) => {
  try {
    await crudOps.getAllWithPagination(req, res, next);
  } catch (error) {
    next(error);
  }
};

const getRsciById = async (req, res, next) => {
  try {
    req.params.id = req.params.rsciId;
    await crudOps.getById(req, res, next);
  } catch (error) {
    next(error);
  }
};

const createRsci = async (req, res, next) => {
  try {
    const businessError = new BusinessError(400, "Bad Request");

    if (req.body.code) {
      const existing = await Rsci.findOne({ where: { code: req.body.code } });
      if (existing) {
        businessError.addError("attributes.code", "RSCI code already exists");
      }
    }

    if (businessError.errors.length > 0) throw businessError;

    await crudOps.create(req, res, next);
  } catch (error) {
    next(error);
  }
};

const updateRsci = async (req, res, next) => {
  try {
    const id = req.params.rsciId;
    const rsci = await Rsci.findByPk(id);

    if (!rsci) {
      throw new NotFoundError("RSCI not found", "Rsci");
    }

    const businessError = new BusinessError(400, "Bad Request");

    if (req.body.code && req.body.code !== rsci.code) {
      const existing = await Rsci.findOne({ where: { code: req.body.code } });
      if (existing) {
        businessError.addError("attributes.code", "RSCI code already exists");
      }
    }

    if (businessError.errors.length > 0) throw businessError;

    req.params.id = id;
    await crudOps.update(req, res, next);
  } catch (error) {
    next(error);
  }
};

const deleteRsci = async (req, res, next) => {
  try {
    const id = req.params.rsciId;
    const rsci = await Rsci.findByPk(id);

    if (!rsci) {
      throw new NotFoundError("RSCI not found", "Rsci");
    }

    await rsci.destroy();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRscis,
  getRsciById,
  createRsci,
  updateRsci,
  deleteRsci,
};
