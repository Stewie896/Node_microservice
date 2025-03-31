// redisClient.js
require("dotenv").config();
const IoRedis = require("ioredis");

// Instantiate Redis client
const redisClient = new IoRedis(process.env.RED_IS);

module.exports = { redisClient };
