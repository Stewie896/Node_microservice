const { rateLimit } = require("express-rate-limit");
const {clientRedis} = require('../utils/Redis/redis');
const {RedisStore} = require("rate-limit-redis")

const endPointlimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 60,
    standardHeaders: true,
    legacyHeaders: false,
    statusCode: 429,
    keyGenerator: (req) => {
      return req.ip;
    },
    handler: (req, res) => {
      return res.json({
        success: false,
        message: "Too many request please try again",
        statusCode: 429,
      });
    },
    store: new RedisStore({
      sendCommand: (...args) => clientRedis.call(...args)
    })
  });

  module.exports = {endPointlimiter}