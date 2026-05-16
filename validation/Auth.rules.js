const Joi = require("joi");

const ALLOWED_FIELDS = [
  "id",
  "name",
  "surname",
  "position",
  "website_url",
  "organization_name",
  "organisation_phone_number",
  "organisation_email",
  "phone_number",
  "address",
  "postal_code",
  "city",
  "state",
  "country",
  "description",
  "tax_number",
  "linkedin",
  "facebook",
  "twitter",
  "logo_url",
  "video_url",
  "email",
  "created_at",
  "updated_at",
];

const ALLOWED_SORT_FIELDS = [
  "name",
  "surname",
  "position",
  "website_url",
  "organization_name",
  "organisation_phone_number",
  "organisation_email",
  "phone_number",
  "address",
  "postal_code",
  "city",
  "state",
  "country",
  "description",
  "tax_number",
  "linkedin",
  "facebook",
  "twitter",
  "logo_url",
  "video_url",
  "email",
  "created_at",
  "updated_at"
];

const signupSchema = {
  type: Joi.string().valid("users").required(),
  attributes: Joi.object()
    .keys({
      name: Joi.string().max(255),
      surname: Joi.string().max(255),
      position: Joi.string().max(255),
      website_url: Joi.string().max(2048),
      organization_name: Joi.string().max(255).required(),
      organisation_phone_number: Joi.string().max(20),
      organisation_email: Joi.string().email(),
      phone_number: Joi.string().max(20).required(),
      address: Joi.string().max(255),
      postal_code: Joi.string().max(20),
      city: Joi.string().max(100),
      state: Joi.string().max(100),
      country: Joi.string().max(100),
      description: Joi.string().max(2000),
      tax_number: Joi.string().max(100),
      linkedin: Joi.string().max(255),
      facebook: Joi.string().max(255),
      twitter: Joi.string().max(255),
      logo_url: Joi.string().max(2048),
      video_url: Joi.string().max(2048),
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
      number: Joi.number().integer().min(0),
      size: Joi.number().integer().custom((value, helpers) => {
        if (value === -1 || (value >= 1 && value <= 100)) {
          return value;
        }
        return helpers.error('number.base');
      }),
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