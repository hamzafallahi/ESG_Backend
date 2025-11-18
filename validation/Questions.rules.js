const Joi = require("joi");

const ALLOWED_FIELDS = [
  "id",
  "section_id",
  "text", 
  "text_fr",
  "score_value",
  "level",
  "created_at",
  "updated_at",
];

const ALLOWED_SORT_FIELDS = ["text", "text_fr", "score_value", "level", "section_id", "created_at", "updated_at"];

const questionDataSchema = {
  type: Joi.string().valid("questions").required(),
  attributes: Joi.object()
    .keys({
      text: Joi.string().max(1000).required(),
      text_fr: Joi.string().max(1000).allow(null),
      score_value: Joi.number().integer().min(0).required(),
      level: Joi.number().integer().min(1).required(),
      section_id: Joi.string().uuid().required(),
    })
    .required(),
};

const questionUpdateDataSchema = {
  type: Joi.string().valid("questions").required(),
  attributes: Joi.object().keys({
    text: Joi.string().max(1000),
    text_fr: Joi.string().max(1000).allow(null),
    level: Joi.number().integer().min(1),
    score_value: Joi.number().integer().min(0),
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
        data: Joi.object().keys(questionDataSchema).required(),
      })
      .options({ abortEarly: false }),
  },
  update: {
    headers: Joi.object().keys({}).unknown(true),
    body: Joi.object()
      .keys({
        data: Joi.object().keys(questionUpdateDataSchema).required(),
      })
      .options({ abortEarly: false }),
  },
  getAll: {
    query: getAllQuerySchema,
        body: Joi.object().keys({}).length(0).messages({
          'object.length': 'GET requests should not contain a body'
        }),
  }
};
