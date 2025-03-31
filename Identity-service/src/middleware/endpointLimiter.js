const rate = require("express-rate-limit");
const { logger } = require("../utils/logger");
const { RedisStore } = require('rate-limit-redis');
const { redisClient } = require('../utils/Redis');


const ra =  rate({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit each IP to 50 requests per windowMs
    message: "Maximum endpoint hit",
    standardHeaders: true, // Use the combined RateLimit header
    legacyHeaders: false, // Disable the X-RateLimit-* headers
    handler: (req, res) => {
      logger.warn("Maximum endpoint hit!");
      res.status(429).json({
        success: false,
        message: "Maximum end-point hit!",
      });
    },
 store: new RedisStore({
  sendCommand: (...args) => redisClient.call(...args)
 })
  });

  const endPointLimiter = ra

module.exports = { endPointLimiter };
