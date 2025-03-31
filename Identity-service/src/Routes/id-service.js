const express = require("express");
const router = express.Router();
const { jwtVerify } = require("../../../API-gateway/src/middleware/JWTVERIFY");
const {
  registerUser,
  loginUser,
  refreshToken,
  logoutDelet,
} = require("../controllers/identity-contorller");

router.post("/post", registerUser);
router.post("/login", loginUser);
router.post("/refreshToken", refreshToken, jwtVerify);
router.post("/logout", logoutDelet);

router.get("/hello", jwtVerify, (req, res) => {
  res.send("Hello");
});
module.exports = { router };
