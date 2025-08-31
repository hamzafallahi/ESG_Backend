const Joi = require("joi");

const ALLOWED_FIELDS = [
  "section_id",
  "category_id",
  "title", 
  "description",
  "created_at",
  "updated_at",
];

const ALLOWED_SORT_FIELDS = ["title", "description", "category_id", "created_at", "updated_at"];

const sectionDataSchema = {
  type: Joi.string().valid("sections").required(),
  attributes: Joi.object()
    .keys({
      title: Joi.string().max(255).required(),
      description: Joi.string().max(1000).allow(null),
      category_id: Joi.number().integer().required(),
    })
    .required(),
};

const sectionUpdateDataSchema = {
  type: Joi.string().valid("sections").required(),
  attributes: Joi.object().keys({
    title: Joi.string().max(255),
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
  })
  .unknown(false);

module.exports = {
  create: {
    headers: Joi.object().keys({}).unknown(true),
    body: Joi.object()
      .keys({
        data: Joi.object().keys(sectionDataSchema).required(),
      })
      .options({ abortEarly: false }),
  },
  update: {
    headers: Joi.object().keys({}).unknown(true),
    body: Joi.object()
      .keys({
        data: Joi.object().keys(sectionUpdateDataSchema).required(),
      })
      .options({ abortEarly: false }),
  },
  getAll: {
    query: getAllQuerySchema,
  }
};
