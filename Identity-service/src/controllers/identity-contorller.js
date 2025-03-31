const { logger } = require("../utils/logger");
const { validator, loginValidator } = require("../utils/joiValidation");
const { Usermodel } = require("../models/userModel");
const argon2 = require("argon2");
const { createTOken } = require("../utils/Generatetoken");
const { RefresMOdel } = require("../models/Refreshtoken");

// USER REGISTRATION
const registerUser = async (req, res, next) => {
  try {
    logger.info("Registration endpoint being hit");

    // VALIDATE USER
    const { username, password, email } = req.body;
    const data = { username, password, email };
    const { error, value } = validator.validate(data);

    if (error) {
      const mappedErr = error.details.map((details) => {
        logger.error("Validation-Err", details.message);
        return details.message;
      });
      return res.status(404).json({
        success: false,
        type: "Validation_Error",
        message: mappedErr,
      });
    }

    const register = await Usermodel.findOne({
      $or: [{ username }, { email }],
    });

    if (!register) {
      const hashedPassword = await argon2.hash(password);
      const model = new Usermodel({
        username: username,
        email: email,
        password: hashedPassword,
      });

      const save = await model.save();

      const { REFTOK, jsonwebtok } = await createTOken(save);

      logger.info({ message: "JWT assigned", userId: save._id });

      return res.status(202).json({
        success: true,
        message: `New User registered: ${username}`,
        tokens: {
          jwt: jsonwebtok,
          refreshToken: REFTOK,
        },
      });
    } else {
      logger.error("REGISTER-USER-error");
      return res.status(404).json({
        success: false,
        message: "User already exists",
      });
    }
  } catch (error) {
    logger.error("INTERNAL SERVER ERR INT", error.stack);
    console.log(error);
    res.status(404).send({
      success: false,
      message: "INTERNAL SERVER ERROR",
    });
  }
}; //CHECKED []

//USER LOGIN
const loginUser = async (req, res, next) => {
  const { username, password } = req.body;
  const validateData = { username, password };
  const { error, value, warning } = await loginValidator.validate(validateData);

  if (error) {
    error.details.forEach((data) => logger.error(`${data.message}`));

    return res.status(401).json({
      success: false,
      message: "Validation Error",
    });
  }

  const dbData = await Usermodel.findOne({ username: username });
  if (!dbData) {
    return res.status(404).json({
      success: false,
      message: "No user found. -Please try again",
    });
  }
  const comparePassword = await argon2.verify(dbData.password, password);
  if (!comparePassword) {
    return res.status(404).json({
      success: false,
      message: "In-correct password -> please try again!",
    });
  }

  const { jsonwebtok, REFTOK } = await createTOken(dbData);

  return res.status(201).json({
    success: true,
    user: `Welcome ${dbData.username}`,
    tokens: {
      jwtToke: jsonwebtok,
      refreshToken: REFTOK,
    },
  });
}; //CHECKED READY TO DEPLOY

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({
        success: "False",
        message: "Refresh token not found!",
      });
    }

    const findeUser = await RefresMOdel.findOne({ token: refreshToken });

    if (!findeUser || findeUser.expires < Date.now()) {
      res.status(404).json({
        success: false,
        message: "Token expired or invalid token",
      });
    }

    const provideTOken = await Usermodel.findOne({
      _id: findeUser.whometoassign,
    });
    const { jsonwebtok, REFTOK } = await createTOken(provideTOken._id);

    await RefresMOdel.deleteOne({ _id: findeUser._id });

    return res.status(201).json({
      success: true,
      message: "Refresh token in action",
      tokens: {
        newRefreshTOken: REFTOK,
        newAccesstoken: jsonwebtok,
      },
    });
  } catch (error) {
    logger.error(`Error in refresh token ${error.message}`);
    console.log(error.stack, error.mssage);
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
}; //HIGH CHANCE OF CAUSING ERROR NOT CHECKED NOT FOR PRODUCTION

const logoutDelet = async (req, res, next) => {
  const { refreshToken } = req.body;
  try {
    if (!refreshToken) {
      logger.warn("Missing refresh token");
      res.status(404).send({
        message: "Missing refresh token",
      });

      await RefresMOdel.deleteOne({ token: refreshToken });
      res.status(201).send({
        success: true,
        message: "Refresh token deleted",
      });
    }
  } catch (error) {
    logger.error(`Logoutdelet refresh token err ${error.message}`);
    res.status(400).send({
      message: "Internal server err ",
    });
  }
};

module.exports = { registerUser, loginUser, refreshToken, logoutDelet };

//THIS IS THE ENDPOINT LIMITER FOR THE IDENTITY-CONTROLLER JS
//[] ?? {}  \\||
