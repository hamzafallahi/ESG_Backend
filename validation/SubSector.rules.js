const Joi = require("joi");

const ALLOWED_FIELDS = ["id", "code", "label", "label_fr", "active", "created_at", "updated_at"];

const ALLOWED_SORT_FIELDS = ["code", "label", "label_fr", "active", "created_at", "updated_at"];

const subSectorDataSchema = {
  type: Joi.string().valid("sub_sectors").required(),
  attributes: Joi.object()
    .keys({
      code: Joi.string().max(50).required(),
      label: Joi.string().max(255).allow(null, ""),
      label_fr: Joi.string().max(255).allow(null, ""),
      active: Joi.boolean(),
    })
    .required(),
};

const subSectorUpdateDataSchema = {
  type: Joi.string().valid("sub_sectors").required(),
  attributes: Joi.object().keys({
    code: Joi.string().max(50),
    label: Joi.string().max(255).allow(null, ""),
    label_fr: Joi.string().max(255).allow(null, ""),
    active: Joi.boolean(),
  }),
};

// weights bulk-set: { data: { weights: { "E1": 39.9, ... } } }
const weightsDataSchema = {
  weights: Joi.object()
    .pattern(Joi.string(), Joi.number().min(0))
    .min(1)
    .required(),
};

const getAllQuerySchema = Joi.object()
  .keys({
    fields: Joi.string().custom((value, helpers) => {
      const requestedFields = value.split(",");
      const invalidFields = requestedFields.filter(
        (field) => !ALLOWED_FIELDS.includes(field)
      );
      if (invalidFields.length > 0) {
        return helpers.error("any.invalid", { invalidFields });
      }
      return value;
    }, "field validation"),

    page: Joi.object().keys({
      size: Joi.number()
        .integer()
        .custom((value, helpers) => {
          if (value === -1 || (value >= 1 && value <= 100)) {
            return value;
          }
          return helpers.error("number.base");
        })
        .default(10),
      number: Joi.number().integer().min(0).default(0),
    }),

    filter: Joi.object().pattern(
      Joi.string().valid(...ALLOWED_FIELDS),
      Joi.alternatives().try(
        Joi.string().max(255),
        Joi.object().pattern(Joi.string(), Joi.string().max(255))
      )
    ),

    sort: Joi.string().custom((value, helpers) => {
      const sortFields = value.split(",");
      const invalidFields = [];

      sortFields.forEach((field) => {
        const sortField = field.replace("-", "");
        if (!ALLOWED_SORT_FIELDS.includes(sortField)) {
          invalidFields.push(field);
        }
      });

      if (invalidFields.length > 0) {
        return helpers.error("any.invalid", {
          invalidSort: invalidFields.join(", "),
          allowedFields: ALLOWED_SORT_FIELDS.join(", "),
        });
      }
      return value;
    }, "sort validation"),

    include: Joi.string().optional(),
  })
  .unknown(false);

module.exports = {
  create: {
    headers: Joi.object().keys({}).unknown(true),
    body: Joi.object()
      .keys({
        data: Joi.object().keys(subSectorDataSchema).required(),
      })
      .options({ abortEarly: false }),
  },
  update: {
    headers: Joi.object().keys({}).unknown(true),
    body: Joi.object()
      .keys({
        data: Joi.object().keys(subSectorUpdateDataSchema).required(),
      })
      .options({ abortEarly: false }),
  },
  setWeights: {
    headers: Joi.object().keys({}).unknown(true),
    body: Joi.object()
      .keys({
        data: Joi.object().keys(weightsDataSchema).required(),
      })
      .options({ abortEarly: false }),
  },
  getAll: {
    query: getAllQuerySchema,
    body: Joi.object().keys({}).length(0).messages({
      "object.length": "GET requests should not contain a body",
    }),
  },
};
