const joi = require("joi");

const validator = joi.object({
  username: joi.string().alphanum().min(3).max(20).required(),
  email: joi.string().lowercase().email().required(),
  password: joi.string().alphanum().min(8).required(),
});

const loginValidator = joi.object({
  username: joi.string().alphanum().min(3).max(20).required(),
  password: joi.string().alphanum().min(8).max(20).required(),
});

module.exports = { validator , loginValidator };
