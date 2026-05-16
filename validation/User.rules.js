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
  "next_allowed_assessment_date",
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
  "next_allowed_assessment_date",
  "created_at",
  "updated_at"
];

const userDataSchema = {
  type: Joi.string().valid("users").required(),
  attributes: Joi.object()
    .keys({
      name: Joi.string().max(255).required(),
      surname: Joi.string().max(255).required(),
      position: Joi.string().max(255),
      website_url: Joi.string().max(2048),
      organization_name: Joi.string().max(255).required(),
      organisation_phone_number: Joi.string().max(20),
      organisation_email: Joi.string().email().required(),
      phone_number: Joi.string().max(20).required(),
      address: Joi.string().max(255),
      postal_code: Joi.string().max(20).required(),
      city: Joi.string().max(100).required(),
      state: Joi.string().max(100).required(),
      country: Joi.string().max(100).required(),
      description: Joi.string().max(2000),
      tax_number: Joi.string().max(100).required(),
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

const userUpdateDataSchema = {
  type: Joi.string().valid("users").required(),
  attributes: Joi.object().keys({
    name: Joi.string().max(255),
    surname: Joi.string().max(255),
    position: Joi.string().max(255),
    website_url: Joi.string().max(2048),
    organization_name: Joi.string().max(255),
    organisation_phone_number: Joi.string().max(20),
    organisation_email: Joi.string().email(),
    phone_number: Joi.string().max(20),
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
    email: Joi.string().email(),
    password: Joi.string().min(6).max(100),
    next_allowed_assessment_date: Joi.date().iso().allow(null),
  }),
};

// Schema for user self-update (users can only update certain fields)
const userSelfUpdateDataSchema = {
  type: Joi.string().valid("users").required(),
  attributes: Joi.object().keys({
    name: Joi.string().max(255),
    surname: Joi.string().max(255),
    position: Joi.string().max(255),
    website_url: Joi.string().max(2048),
    organization_name: Joi.string().max(255),
    organisation_phone_number: Joi.string().max(20),
    organisation_email: Joi.string().email(),
    phone_number: Joi.string().max(20),
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
