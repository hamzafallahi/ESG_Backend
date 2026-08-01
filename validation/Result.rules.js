const Joi = require("joi");

const ALLOWED_FIELDS = [
  "id",
  "user_id",
  "total_score",
  "global_feedback",
  "current_rank",
  "created_at",
  "updated_at",
  "deleted_at",
];

const ALLOWED_SORT_FIELDS = ["id", "user_id", "total_score", "current_rank", "created_at", "updated_at"];

const attachmentSchema = Joi.object({
  url: Joi.string().uri().required(),
  public_id: Joi.string().required(),
  original_name: Joi.string().max(255).required(),
  size: Joi.number().integer().min(0).required(),
  mime_type: Joi.string().max(100).required(),
});

const justificationSchema = Joi.object({
  proof_type: Joi.string().max(100).allow(null, ''),
  description: Joi.string().min(10).max(500).allow(null, ''),
  document_date: Joi.date().iso().max('now').allow(null),
  reference_number: Joi.string().max(100).allow(null, ''),
  evaluator_comment: Joi.string().max(500).allow(null, ''),
  attachment_urls: Joi.array().items(attachmentSchema).max(3).default([]),
}).allow(null);

const answerValueSchema = Joi.object({
  type: Joi.string().valid('YES', 'NN', 'NA', 'NAC').required(),
  nac_percentage: Joi.number().min(1).max(100).when('type', {
    is: 'NAC',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  justification: justificationSchema,
});

const resultDataSchema = {
  type: Joi.string().valid("Result").required(),
  attributes: Joi.object()
    .keys({
      global_feedback: Joi.string().allow(null, ''),
      // All scores are computed server-side; only answers are required from the client
      answers: Joi.object()
        .pattern(Joi.string().uuid(), answerValueSchema)
        .required(),
    })
    .required(),
};

const resultUpdateDataSchema = {
  type: Joi.string().valid("Result").required(),
  attributes: Joi.object()
    .keys({
      user_id: Joi.string().uuid(),
      total_score: Joi.number().integer().allow(null),
      global_feedback: Joi.string().allow(null),
      current_rank: Joi.number().integer().allow(null),
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
        if (value === -1 || value >= 1) {
          return value;
        }
        return helpers.error('number.min', { limit: 1 });
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
        data: Joi.object().keys(resultDataSchema).required(),
      })
      .options({ abortEarly: false }),
  },
  update: {
    headers: Joi.object().keys({}).unknown(true),
    body: Joi.object()
      .keys({
        data: Joi.object().keys(resultUpdateDataSchema).required(),
      })
      .options({ abortEarly: false }),
  },
  getAll: {
    query: getAllQuerySchema,
        body: Joi.object().keys({}).length(0).messages({
          'object.length': 'GET requests should not contain a body'
        }),
  },
  ALLOWED_FIELDS,
  ALLOWED_SORT_FIELDS
};
