const jwt = require("jsonwebtoken");
const { logger } = require("../utils/logger");
const crypto = require("crypto");
const { RefresMOdel } = require("../models/Refreshtoken");
require('dotenv').config()

function jwtTOKEN(x) {
  const payload = {
    user_id: x._id,
    username: x.username,
  };

  try {
    const token = jwt.sign(payload ,  process.env.JWT_SECRET, {
      expiresIn: "100m",
    });
    logger.info({ message: "JWT assigned", userId: x._id }); // Corrected reference
    return token;
  } catch (error) {
    logger.error({ message: "Failed to assign JWT", error: error.message, stack: error.stack });
    console.log(error)
    throw new Error("JWT assignment failed");
  }
}

const freshTokn = async (ur) => {
  const encryptedRefreshToken = crypto.randomBytes(100).toString("hex");
  let date = new Date();
  date.setDate(date.getDate() + 7);

  await RefresMOdel.create({
    token: encryptedRefreshToken,
    whometoassign: ur._id,
    expires: date,
  });

  logger.info({ message: "Refresh token Created", userId: ur._id });
  return encryptedRefreshToken; // Ensure the function returns the token
};

const createTOken = async (user) => {
  try {
    const jsonwebtok = await jwtTOKEN(user);
    const REFTOK = await freshTokn(user);

    return { jsonwebtok, REFTOK };
  } catch (error) {
    logger.error({ message: "Failed to assign JWT", error: error.message, stack: error.stack });
    throw error;
  }
};

module.exports = { createTOken };
