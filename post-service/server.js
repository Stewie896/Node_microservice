const express = require("express");
const app = express();
const helmet = require("helmet");
const cors = require("cors");
const { Redis } = require("ioredis");
const { rateLimit } = require("express-rate-limit");
const { RateLimiterRedis } = require("rate-limiter-flexible");
const { logger } = require("./src/utils/logger");
const { RedisStore } = require("rate-limit-redis");
const port = process.env.PORT || 3002;
const { globalErrHandler } = require("./src/middleware/errhandler");
const { router } = require("./src/routes/routes");
require('./cloudinary/config');
const mongoose = require('mongoose')
require('dotenv').config()

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(req.body);
  logger.info(req.url);
  logger.info(req.ip);
  logger.info(req.method);
  next();
});

const redisClient = new Redis(process.env.RED_IS);
redisClient.on("connect", () => {
  console.log("Connected to redis");
});

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  points: 50,
  duration: 1,
});

app.use((req, res, next) => {
  rateLimiter
    .consume(req.ip)
    .then(() => {
      next();
    })
    .catch((err) =>
      /* logger.error(`Error at rateLimiter.consume ${err}`);*/ res
        .status(429)
        .json({
          message: "Too many req please try again",
        })
    );
});

mongoose.connect("mongodb+srv://abhiralchhetri6:abhiral123@cluster0.cyegc.mongodb.net/").then(()=>{
  logger.info("Connected to mongo db succesfully")
}).catch(e => logger.error(`Error in mongo db ${e.message}`))

const sensitiveEndpointlimiter = rateLimit({
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
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

app.use(
  "/api",
  sensitiveEndpointlimiter,
  (req, res, next) => {
    req.redisClient = redisClient;
    next();
  },
  router
);

app.get("/hello", sensitiveEndpointlimiter, (req, res) => {
  res.send("hello");
});

app.use(globalErrHandler);

app.listen(port, (err) => {
  if (err) logger.error("PORT 3002 err");
  else logger.info(`Succesfully listening to port ${port}`);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error(
    `which code was rejected ${promise} && reason for the promise rejection ${reason}`,
    console.log("PRomise", promise)
  );
});
