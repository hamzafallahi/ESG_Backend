const Joi = require("joi");

const ALLOWED_FIELDS = [
  "id",
  "organization_name",
  "phone_number",
  "email",
  "next_allowed_assessment_date",
  "created_at",
  "updated_at",
];

const ALLOWED_SORT_FIELDS = [
  "organization_name",
  "email",
  "next_allowed_assessment_date",
  "created_at",
  "updated_at"
];

const userDataSchema = {
  type: Joi.string().valid("users").required(),
  attributes: Joi.object()
    .keys({
      organization_name: Joi.string().max(255).required(),
      phone_number: Joi.string().max(20).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).max(100).required(),
    })
    .required(),
};

const userUpdateDataSchema = {
  type: Joi.string().valid("users").required(),
  attributes: Joi.object().keys({
    organization_name: Joi.string().max(255),
    phone_number: Joi.string().max(20),
    email: Joi.string().email(),
    password: Joi.string().min(6).max(100),
    next_allowed_assessment_date: Joi.date().iso().allow(null),
  }),
};

// Schema for user self-update (users can only update certain fields)
const userSelfUpdateDataSchema = {
  type: Joi.string().valid("users").required(),
  attributes: Joi.object().keys({
    organization_name: Joi.string().max(255),
    phone_number: Joi.string().max(20),
    email: Joi.string().email(),
    password: Joi.string().min(6).max(100),
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
        data: Joi.object().keys(userDataSchema).required(),
      })
      .options({ abortEarly: false }),
  },
  update: {
    headers: Joi.object().keys({}).unknown(true),
    body: Joi.object()
      .keys({
        data: Joi.object().keys(userUpdateDataSchema).required(),
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
  selfUpdate: {
    headers: Joi.object().keys({}).unknown(true),
    body: Joi.object()
      .keys({
        data: Joi.object().keys(userSelfUpdateDataSchema).required(),
      })
      .options({ abortEarly: false }),
  },
  getOwnProfile: {
    query: Joi.object().keys({}).unknown(false),
    body: Joi.object().keys({}).length(0).messages({
      'object.length': 'GET requests should not contain a body'
    }),
  },
};
