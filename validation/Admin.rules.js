const Joi = require("joi");

const ALLOWED_FIELDS = [
  "id",
  "username",
  "email",
  "first_name",
  "last_name",
  "is_active",
  "created_by",
  "created_at",
  "updated_at",
];

const ALLOWED_SORT_FIELDS = ["username", "email", "first_name", "last_name", "is_active", "created_at", "updated_at"];

const adminDataSchema = {
  type: Joi.string().valid("admins").required(),
  attributes: Joi.object()
    .keys({
      username: Joi.string().min(3).max(50).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).max(100).required(),
      first_name: Joi.string().max(255).allow(null),
      last_name: Joi.string().max(255).allow(null),
      is_active: Joi.boolean().default(true),
    })
    .required(),
};

const adminUpdateDataSchema = {
  type: Joi.string().valid("admins").required(),
  attributes: Joi.object().keys({
    username: Joi.string().min(3).max(50),
    email: Joi.string().email(),
    password: Joi.string().min(6).max(100),
    first_name: Joi.string().max(255).allow(null),
    last_name: Joi.string().max(255).allow(null),
    is_active: Joi.boolean(),
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
        data: Joi.object().keys(adminDataSchema).required(),
      })
      .options({ abortEarly: false }),
  },
  update: {
    headers: Joi.object().keys({}).unknown(true),
    body: Joi.object()
      .keys({
        data: Joi.object().keys(adminUpdateDataSchema).required(),
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
  }
};
