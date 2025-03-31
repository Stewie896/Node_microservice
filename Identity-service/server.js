require("dotenv").config();
const PORT = process.env.PORT || 3001;
const express = require("express");
const app = express();
const helmet = require("helmet");
const { customCors } = require("./src/cors/cors");
const { router } = require("./src/Routes/id-service");
const { logger } = require("./src/utils/logger");
const { RateLimiterRedis } = require("rate-limiter-flexible");
const { endPointLimiter } = require("./src/middleware/endpointLimiter");
const { errHandler } = require("./src/middleware/Errhandler");
const { redisClient } = require("./src/utils/Redis");
require("./db/db");

app.use(helmet());
app.use(customCors());  //COULD cause Err
app.use(express.json())

// app.use(router)

// Instantiate Redis client
// const Redis = new IoRedis(process.env.RED_IS);

app.use((req, res, next) => {
  logger.info(`Req Method  ${req.method} to ${req.url}`);
  logger.info(`Req Body ${req.body}`);
  next();
});

const limiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "Global-Redis-Rate-Limiter",
  points: 1,
  duration: 1,
});

app.use((req, res, next) => {
  limiter
    .consume(req.ip)
    .then(() => next())
    .catch((e) => {
      logger.warn("Error in rate limiter [redis-io]", e);
      return res.status(429).json({
        success: false,
        message: "Maximum endpoint hit!",
      });
    });
});
app.use("/api", endPointLimiter, router);

app.get("/test", (req, res) => {
  res.send("Server is running");
});

app.post('/hello' , (req , res)=>{
  res.send("Post method working succesfully")
})

app.use(errHandler);

app.listen(PORT, () => {
  try {
    logger.info(`Successfully listening to port ${PORT}`);
  } catch (error) {
    logger.error(error);
  }
});

// process.on("uncaughtException", (err) => {
//   console.error("There was an uncaught error", err);
//   process.exit(1); // Optional: Exit the process after handling the error
// });
