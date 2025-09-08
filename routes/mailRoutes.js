const express = require('express');
const router = express.Router();
const { sendResults } = require("../controllers/mailController.js");
const { sendResults: mailValidation } = require('../validation/Mail.rules.js');
const MailDeserializer = require('../deserializer/maildeserializer.js');
const deserializeMiddleware = require('../middleware/deserializeMiddleware');
const validate = require('../middleware/validationMiddleware');

router.post("/", validate(mailValidation), deserializeMiddleware(MailDeserializer), sendResults);

module.exports = router;

