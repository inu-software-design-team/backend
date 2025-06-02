const express = require("express");
const {
  register,
  checkId,
  login,
  mainInfo,
  logout,
} = require("../controllers/registerController");
const { kakaoLogin, kakaoCallback } = require("../controllers/authController");

const csrf = require("csurf");
const csrfProtection = csrf();

const router = express.Router();

// 현재 prefix 경로 /api/v1/users
//auth
router.get("/kakao/login", kakaoLogin);
router.get("/kakao/callback", kakaoCallback);

//일반 로그인
router.post("/sign-up", register); // 정보 입력
router.post("/check-id", checkId); // 역할 검사
router.post("/login", login); // 로그인

router.post("/logout", logout); // 로그아웃

// 메인 화면(유저 이름)
router.get("/dashboard", mainInfo);

// 교사 전용 라우팅
router.use("/teacher", require("./teacherRoutes"));

// 학생 전용 라우팅
router.use("/student", require("./studentRoutes"));

// 학부모 전용 라우팅
router.use("/parent", require("./parentRoutes"));

// 토큰 발급용 엔드포인트
//csrfSecret 이걸 암호화 한 토큰 (세션이랑 짝을 맺음)
router.get("/csrf-token", csrfProtection, (req, res) => {
  console.log("현재 세션:", req.session); // 콘솔에 출력
  return res.json({ csrfToken: req.csrfToken() });
});

//세션 체크용
router.get("/session-check", (req, res) => {
  res.json({ session: req.session });
});

module.exports = router;
