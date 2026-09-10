'use strict';

const axios = require('axios');
const config = require('../config/app-config');

const VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

/**
 * Verify a reCAPTCHA token with Google's siteverify endpoint.
 * @param {string} token - The g-recaptcha-response token from the client
 * @param {string} [remoteIp] - The client's IP address (optional, improves accuracy)
 * @returns {Promise<boolean>} true if the token is valid
 */
const verifyRecaptchaToken = async (token, remoteIp) => {
  if (!token) return false;

  const secret = config.recaptchaSecretKey;
  if (!secret) {
    // Fail closed: if the server isn't configured, treat as unverifiable.
    console.error('RECAPTCHA_SECRET_KEY is not configured');
    return false;
  }

  try {
    const params = new URLSearchParams();
    params.append('secret', secret);
    params.append('response', token);
    if (remoteIp) params.append('remoteip', remoteIp);

    const { data } = await axios.post(VERIFY_URL, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 8000,
    });

    return !!data.success;
  } catch (error) {
    console.error('reCAPTCHA verification request failed:', error.message);
    return false;
  }
};

module.exports = { verifyRecaptchaToken };
