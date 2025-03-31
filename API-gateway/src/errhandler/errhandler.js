const { logger } = require("../utils/logger");

const errHandler = (err, req, res, next) => {
  logger.error("Global err handler", err);

  return res.status(err.status || 5000).json({
    message: err.message || "Global err handler",
  });
};


module.exports = { errHandler };
