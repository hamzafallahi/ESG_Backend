const Joi = require("joi");

const ALLOWED_FIELDS = [
  "id",
  "user_id",
  "answers",
  "current_page",
  "ui_state",
  "total_questions",
  "answered_questions",
  "completion_percentage",
  "created_at",
  "updated_at",
];

const ALLOWED_SORT_FIELDS = [
  "user_id",
  "current_page",
  "total_questions",
  "answered_questions",
  "completion_percentage",
  "created_at",
  "updated_at"
];

const assessmentProgressDataSchema = {
  type: Joi.string().valid("assessment_progress").required(),
  attributes: Joi.object()
    .keys({
      user_id: Joi.string().uuid().required(),
      answers: Joi.object().default({}),
      current_page: Joi.number().integer().min(0).default(0),
      ui_state: Joi.object().default({}),
      total_questions: Joi.number().integer().min(0).default(0),
      answered_questions: Joi.number().integer().min(0).default(0),
      completion_percentage: Joi.number().min(0).max(100).default(0),
    })
    .required(),
};

const assessmentProgressUpdateDataSchema = {
  type: Joi.string().valid("assessment_progress").required(),
  attributes: Joi.object()
    .keys({
      user_id: Joi.string().uuid(),
      answers: Joi.object(),
      current_page: Joi.number().integer().min(0),
      ui_state: Joi.object(),
      total_questions: Joi.number().integer().min(0),
      answered_questions: Joi.number().integer().min(0),
      completion_percentage: Joi.number().min(0).max(100),
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

    include: Joi.string().valid("user").optional(),
  })
  .unknown(false);

module.exports = {
  create: {
    headers: Joi.object().keys({}).unknown(true),
    body: Joi.object()
      .keys({
        data: Joi.object().keys(assessmentProgressDataSchema).required(),
      })
      .options({ abortEarly: false }),
  },
  update: {
    headers: Joi.object().keys({}).unknown(true),
    body: Joi.object()
      .keys({
        data: Joi.object().keys(assessmentProgressUpdateDataSchema).required(),
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
