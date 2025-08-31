const Joi = require("joi");
const BusinessError = require('../error/BusinessError');

module.exports = options => {
    return async (req, res, next) => {
        try {
            // Validate headers if schema provided
            if (options.headers) {
                const { error } = options.headers.validate(req.headers, {
                    abortEarly: false,
                    convert: true
                });
                if (error) {
                    const businessError = new BusinessError(400, "VALIDATION_ERROR", "Invalid request headers");
                    error.details.forEach((detail) => {
                        businessError.addError(detail.path.join('.'), detail.message);
                    });
                    throw businessError;
                }
            }
            // Validate query parameters if schema provided
            if (options.query) {
                const { error } = options.query.validate(req.query, {
                    abortEarly: false,
                    convert: true
                });
                if (error) {
                    const businessError = new BusinessError(400, "VALIDATION_ERROR", "Invalid query parameters");
                    error.details.forEach((detail) => {
                        businessError.addError(detail.path.join('.'), detail.message);
                    });
                    throw businessError;
                }
            }
            // Validate body if schema provided
            if (options.body) {
                const { error } = options.body.validate(req.body, {
                    abortEarly: false,
                    convert: true
                });
                if (error) {
                    const businessError = new BusinessError(400, "VALIDATION_ERROR", "Invalid request body");
                    error.details.forEach((detail) => {
                        businessError.addError(detail.path.join('.'), detail.message);
                    });
                    throw businessError;
                }
            }

            // Add params validation support
            if (options.params) {
                const { error } = options.params.validate(req.params, {
                    abortEarly: false,
                    convert: true
                });
                if (error) {
                    const businessError = new BusinessError(400, "VALIDATION_ERROR", "Invalid request parameters");
                    error.details.forEach((detail) => {
                        businessError.addError(detail.path.join('.'), detail.message);
                    });
                    throw businessError;
                }
            }
            
            next();
        } catch (error) {
           
            next(error);
        }
    };
};
