const BusinessError = require('../error/BusinessError');
const { verifyRecaptchaToken } = require('../services/recaptchaService');

/**
 * Verifies the reCAPTCHA token sent by the client and rejects the request
 * if it is missing or invalid. Expects `recaptcha_token` in req.body.
 */
const verifyRecaptcha = async (req, res, next) => {
  try {
    const { recaptcha_token } = req.body;

    const businessError = new BusinessError(400, 'VALIDATION_ERROR', 'reCAPTCHA verification failed');

    if (!recaptcha_token) {
      businessError.addError('recaptcha_token', 'reCAPTCHA token is required');
      throw businessError;
    }

    const remoteIp = req.ip || req.headers['x-forwarded-for'];
    const isValid = await verifyRecaptchaToken(recaptcha_token, remoteIp);

    if (!isValid) {
      businessError.addError('recaptcha_token', 'reCAPTCHA verification failed, please try again');
      throw businessError;
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { verifyRecaptcha };
