const Joi = require("joi");

const ALLOWED_FIELDS = [
  "id",
  "organization_name",
  "phone_number",
  "email",
  "created_at",
  "updated_at",
];

const ALLOWED_SORT_FIELDS = ["organization_name", "email", "created_at", "updated_at"];

const signupSchema = {
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

const loginSchema = {
  type: Joi.string().valid("users").required(),
  attributes: Joi.object()
    .keys({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    })
    .required(),
};

const createRules = {
  body: Joi.object({
    data: Joi.object(signupSchema).required(),
  }),
};

const loginRules = {
  body: Joi.object({
    data: Joi.object(loginSchema).required(),
  }),
};

const indexRules = {
  query: Joi.object({
    fields: Joi.object({
      users: Joi.array()
        .items(Joi.string().valid(...ALLOWED_FIELDS))
        .single(),
    }),
    sort: Joi.string().pattern(
      new RegExp(`^(-)?${ALLOWED_SORT_FIELDS.join("|")}$`)
    ),
    page: Joi.object({
      number: Joi.number().integer().min(1),
      size: Joi.number().integer().min(1).max(100),
    }),
  }),
};

const showRules = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
  query: Joi.object({
    fields: Joi.object({
      users: Joi.array()
        .items(Joi.string().valid(...ALLOWED_FIELDS))
        .single(),
    }),
  }),
};

module.exports = {
  createRules,
  loginRules,
  indexRules,
  showRules,
  ALLOWED_FIELDS,
};