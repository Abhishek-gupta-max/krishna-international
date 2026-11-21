'use strict';

const ApiError = require('../utils/ApiError');

/**
 * Validate and sanitise `req[source]` with a Joi schema.
 * Unknown keys are stripped and values are coerced/trimmed by the schema.
 */
module.exports = function validate(schema, source = 'body') {
  return (req, res, next) => {
    const { value, error } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });
    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message.replace(/["]/g, ''),
      }));
      return next(ApiError.unprocessable('Please correct the highlighted fields.', details));
    }
    if (source === 'query') {
      // req.query is a getter in newer Express versions; mutate in place.
      Object.keys(req.query).forEach((k) => delete req.query[k]);
      Object.assign(req.query, value);
    } else {
      req[source] = value;
    }
    next();
  };
};
