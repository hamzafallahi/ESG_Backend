const Joi = require('joi');

const updateBodySchema = Joi.object()
  .keys({
    title: Joi.string().max(5000).required(),
    first_paragraph: Joi.string().max(20000).required(),
    second_paragraph: Joi.string().max(20000).required(),
  })
  .required();

module.exports = {
  update: {
    headers: Joi.object().keys({}).unknown(true),
    query: Joi.object()
      .keys({
        lang: Joi.string().valid('en', 'fr').optional(),
      })
      .unknown(false),
    body: updateBodySchema,
  },
};
