const express = require("express");
const { register, login ,googleSignup , getProfile,logout} = require("../controllers/authController");

const router = express.Router();

router.post("/signup", register);
router.post("/login", login);
router.post("/google-signup",googleSignup);
router.get("/profile/:id", getProfile);
router.post("/logout",logout);


module.exports = router;
