const Joi = require("joi");

// Retake request validation (user submitting)
const retakeRequest = {
  headers: Joi.object().keys({}).unknown(true),
  body: Joi.object()
    .keys({
      reason: Joi.string().max(1000).allow(null, '').optional()
    })
    .options({ abortEarly: false }),
};

// Contact us validation (public - visitor or authenticated)
const contactUs = {
  headers: Joi.object().keys({}).unknown(true),
  body: Joi.object()
    .keys({
      subject: Joi.string().max(255).required(),
      organization_name: Joi.string().max(255).allow(null, '').optional(),
      email: Joi.string().email().allow(null, '').optional(),
      message: Joi.string().max(5000).required(),
      recaptcha_token: Joi.string().required()
    })
    .options({ abortEarly: false }),
};

// Bug report validation (authenticated users only)
const bugReport = {
  headers: Joi.object().keys({}).unknown(true),
  body: Joi.object()
    .keys({
      category: Joi.string().max(100).allow(null, '').optional().default('bug'),
      subject: Joi.string().max(255).required(),
      organization_name: Joi.string().max(255).allow(null, '').optional(),
      email: Joi.string().email().allow(null, '').optional(),
      message: Joi.string().max(5000).required()
    })
    .options({ abortEarly: false }),
};

// Support request validation (authenticated users only)
const supportRequest = {
  headers: Joi.object().keys({}).unknown(true),
  body: Joi.object()
    .keys({
      category: Joi.string().max(100).allow(null, '').optional().default('support'),
      subject: Joi.string().max(255).required(),
      organization_name: Joi.string().max(255).allow(null, '').optional(),
      email: Joi.string().email().allow(null, '').optional(),
      message: Joi.string().max(5000).required()
    })
    .options({ abortEarly: false }),
};

// Retake approve/disapprove validation (admin action)
const retakeResponse = {
  headers: Joi.object().keys({}).unknown(true),
  body: Joi.object()
    .keys({})
    .options({ abortEarly: false }),
};

module.exports = {
  retakeRequest,
  contactUs,
  bugReport,
  supportRequest,
  retakeResponse
};
