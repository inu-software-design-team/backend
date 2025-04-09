const express = require("express");
const {
  register,
  checkId,
  login,
} = require("../controllers/registerController");

const router = express.Router();

router.post("/sign-up", register); //회원가입
router.get("/check-id", checkId); //역할 검사
router.post("/login", login);

module.exports = router;
