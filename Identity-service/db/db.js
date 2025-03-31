const mongoose = require("mongoose");
const { logger } = require("../src/utils/logger");

require("dotenv").config();

const connectTOMongoose = mongoose
  .connect(process.env.MONGOOSESTR)
  .then(() => logger.info("Connected to mongoose"))
  .catch((e) => logger.error("Error while logging to mongo-db", e.stack));


  

module.exports = { connectTOMongoose };



