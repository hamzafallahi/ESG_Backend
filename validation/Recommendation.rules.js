const Joi = require("joi");

const ALLOWED_FIELDS = [
  "id",
  "category_id",
  "level",
  "name",
  "name_fr",
  "image",
  "created_at",
  "updated_at",
  "deleted_at",
];

const ALLOWED_SORT_FIELDS = ["level", "name", "created_at", "updated_at"]; // subset

const recommendationDataSchema = {
  type: Joi.string().valid("recommendations").required(),
  attributes: Joi.object()
    .keys({
      category_id: Joi.string().uuid().required(),
      level: Joi.number().integer().min(0).required(),
      name: Joi.string().max(500).required(),
      name_fr: Joi.string().max(500).allow(null),
      image: Joi.string().base64().allow(null), // base64 string for image blob
    })
    .required(),
};

const recommendationUpdateDataSchema = {
  type: Joi.string().valid("recommendations").required(),
  attributes: Joi.object().keys({
    category_id: Joi.string().uuid(),
    level: Joi.number().integer().min(0),
    name: Joi.string().max(500),
    name_fr: Joi.string().max(500).allow(null),
    image: Joi.string().base64().allow(null),
  }),
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
      size: Joi.number().integer().min(1).max(100).default(10),
      number: Joi.number().integer().min(0).default(0),
    }),
    filter: Joi.object().pattern(
      Joi.string().valid(...ALLOWED_FIELDS),
      Joi.string().max(100)
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
        data: Joi.object().keys(recommendationDataSchema).required(),
      })
      .options({ abortEarly: false }),
  },
  update: {
    headers: Joi.object().keys({}).unknown(true),
    body: Joi.object()
      .keys({
        data: Joi.object().keys(recommendationUpdateDataSchema).required(),
      })
      .options({ abortEarly: false }),
  },
  delete: {
    headers: Joi.object().keys({}).unknown(true),
    body: Joi.object().keys({}).length(0).messages({
      'object.length': 'DELETE requests should not contain a body'
    }),
  },
  getAll: {
    query: getAllQuerySchema,
    body: Joi.object().keys({}).length(0).messages({
      'object.length': 'GET requests should not contain a body'
    }),
  },
  ALLOWED_FIELDS,
  ALLOWED_SORT_FIELDS,
};
