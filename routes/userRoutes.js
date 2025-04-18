const express = require("express");
const {
  register,
  checkId,
  login,
} = require("../controllers/registerController");
const { kakaoLogin, kakaoCallback } = require("../controllers/authController");

const csrf = require("csurf");
const csrfProtection = csrf();

const router = express.Router();

//auth
router.get("/kakao/login", kakaoLogin);
router.get("/kakao/callback", kakaoCallback);

//일반 로그인
router.post("/sign-up", register); //회원가입
router.get("/check-id", checkId); //역할 검사
router.post("/login", csrfProtection, login); //로그인

// 토큰 발급용 엔드포인트
//csrfSecret 이걸 암호화 한 토큰 (세션이랑 짝을 맺음)
router.get("/csrf-token", csrfProtection, (req, res) => {
  console.log("현재 세션:", req.session); // 콘솔에 출력
  res.json({ csrfToken: req.csrfToken() });
});

//세션 체크용
router.get("/session-check", (req, res) => {
  res.json({ session: req.session });
});

module.exports = router;
