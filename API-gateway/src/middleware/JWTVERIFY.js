const jsonwebtoken = require("jsonwebtoken");
const { logger } = require("../../../Identity-service/src/utils/logger");
require("dotenv").config();

const jwtVerify = async (req, res, next) => {
  try {
    const authorization = req.headers["authorization"];

    if (!authorization) {
      return res.status(401).json({
        success: false,
        message: "Authorization header missing",
      });
    }

    const token = authorization.split(" ")[1];
    console.log(token); //

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Missing bearer token",
      });
    }

    const ver = jsonwebtoken.verify(token, process.env.JWT_SECRET);
    // If the token is successfully verified, proceed to the next middleware;
    console.log(ver);
    req.user = ver;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      console.log(error.message);
    }

    logger.error(`Error at jwt catch block: ${error.message}`);
    console.log(error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired",
      });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token signature",
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
};

module.exports = { jwtVerify };


//Module.exoport jwt verrify 
//Checked woirking 