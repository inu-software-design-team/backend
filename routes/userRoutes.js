const express = require("express");
const { register } = require("../controllers/registerController");

const router = express.Router();

router.post("/sign-up", register); //회원가입

module.exports = router;
