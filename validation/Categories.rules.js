const Joi = require("joi");

const ALLOWED_FIELDS = [
  "id",
  "name",
  "name_fr",
  "description",
  "created_at",
  "updated_at",
];

const ALLOWED_SORT_FIELDS = ["name", "name_fr", "description", "created_at", "updated_at"];

const categoryDataSchema = {
  type: Joi.string().valid("categories").required(),
  attributes: Joi.object()
    .keys({
      name: Joi.string().max(255).required(),
      name_fr: Joi.string().max(255).allow(null),
      description: Joi.string().max(1000).allow(null),
    })
    .required(),
};

const categoryUpdateDataSchema = {
  type: Joi.string().valid("categories").required(),
  attributes: Joi.object().keys({
    name: Joi.string().max(255),
    name_fr: Joi.string().max(255).allow(null),
    description: Joi.string().max(1000).allow(null),
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
      size: Joi.number().integer().custom((value, helpers) => {
        if (value === -1 || (value >= 1 && value <= 100)) {
          return value;
        }
        return helpers.error('number.base');
      }).default(10),
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
          allowedFields: ALLOWED_SORT_FIELDS.join(", ")
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
        data: Joi.object().keys(categoryDataSchema).required(),
      })
      .options({ abortEarly: false }),
  },
  update: {
    headers: Joi.object().keys({}).unknown(true),
    body: Joi.object()
      .keys({
        data: Joi.object().keys(categoryUpdateDataSchema).required(),
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
  }
};
