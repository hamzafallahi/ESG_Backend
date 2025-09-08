const Joi = require("joi");

const ALLOWED_FIELDS = [
  "id",
  "organization_name",
  "phone_number",
  "email",
  "result_data",
  "success",
  "message",
  "sent_at",
];

const resultDataSchema = Joi.object().keys({
  globalScore: Joi.number().integer().min(0).max(955).required(),
  categoryScores: Joi.object().keys({
    "Environnement": Joi.number().integer().min(0).max(235).required(),
    "Social": Joi.number().integer().min(0).max(405).required(),
    "Gouvernance": Joi.number().integer().min(0).max(315).required(),
  }).required(),
  categoryLevels: Joi.object().keys({
    "Environnement": Joi.string().valid("N1", "N2", "N3", "N4").required(),
    "Social": Joi.string().valid("N1", "N2", "N3", "N4").required(),
    "Gouvernance": Joi.string().valid("N1", "N2", "N3", "N4").required(),
  }).required(),
});

const mailDataSchema = {
  type: Joi.string().valid("mail").required(),
  attributes: Joi.object()
    .keys({
      organization_name: Joi.string().max(255).required(),
      phone_number: Joi.string().pattern(/^[+]?[0-9\s\-\(\)]+$/).max(20).optional(),
      email: Joi.string().email().required(),
      result_data: resultDataSchema.required(),
    })
    .required(),
};

const sendResultsQuerySchema = Joi.object()
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
  })
  .unknown(false);

module.exports = {
  sendResults: {
    headers: Joi.object().keys({}).unknown(true),
    body: Joi.object()
      .keys({
        data: Joi.object().keys(mailDataSchema).required(),
      })
      .options({ abortEarly: false }),
    query: sendResultsQuerySchema,
  }
};
