const { body } = require('express-validator')

exports.createShortUrlValidation = [
  body("originalUrl")
    .notEmpty()
    .withMessage("URL is required")
    .isURL({ require_protocol: true })
    .withMessage("Invalid format"),
  (req, res, next) => {
    console.log("Proceeding with validation");
    next();
  },
  body("customCode")
    .optional()
    .isAlphanumeric()
    .withMessage("Custom code must be alphanumeric")
    .isLength({ min: 3, max: 10 })
    .withMessage("Custom code must be 3-10 characters"),
];
