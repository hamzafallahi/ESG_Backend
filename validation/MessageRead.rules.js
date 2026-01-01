const Joi = require("joi");

const ALLOWED_FIELDS = [
  "id",
  "message_id",
  "admin_id",
  "super_admin_id",
  "created_at",
  "updated_at",
];

const ALLOWED_SORT_FIELDS = ["created_at", "updated_at"];

const messageReadDataSchema = {
  type: Joi.string().valid("message_reads").required(),
  attributes: Joi.object()
    .keys({
      message_id: Joi.string().uuid().required(),
      admin_id: Joi.string().uuid().allow(null),
      super_admin_id: Joi.string().uuid().allow(null),
    })
    .custom((value, helpers) => {
      // Ensure exactly one reader is specified
      const { admin_id, super_admin_id } = value;
      
      if (!admin_id && !super_admin_id) {
        return helpers.error('object.missingReader');
      }
      
      if (admin_id && super_admin_id) {
        return helpers.error('object.bothReaders');
      }
      
      return value;
    }, "reader validation")
    .required()
    .messages({
      'object.missingReader': 'Either admin_id or super_admin_id must be provided',
      'object.bothReaders': 'Cannot have both admin_id and super_admin_id set',
    }),
};

const messageReadUpdateDataSchema = {
  type: Joi.string().valid("message_reads").required(),
  attributes: Joi.object()
    .keys({
      message_id: Joi.string().uuid(),
      admin_id: Joi.string().uuid().allow(null),
      super_admin_id: Joi.string().uuid().allow(null),
    })
    .custom((value, helpers) => {
      // If both admin_id and super_admin_id are being updated, validate
      const { admin_id, super_admin_id } = value;
      
      if ((admin_id !== undefined || super_admin_id !== undefined)) {
        if (!admin_id && !super_admin_id) {
          return helpers.error('object.missingReader');
        }
        
        if (admin_id && super_admin_id) {
          return helpers.error('object.bothReaders');
        }
      }
      
      return value;
    }, "reader validation")
    .messages({
      'object.missingReader': 'Either admin_id or super_admin_id must be provided',
      'object.bothReaders': 'Cannot have both admin_id and super_admin_id set',
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
      Joi.alternatives().try(
        Joi.string().max(100),
        Joi.object()
      )
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
        data: Joi.object().keys(messageReadDataSchema).required(),
      })
      .options({ abortEarly: false }),
  },
  update: {
    headers: Joi.object().keys({}).unknown(true),
    body: Joi.object()
      .keys({
        data: Joi.object().keys(messageReadUpdateDataSchema).required(),
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
