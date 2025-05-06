const User = require("../models/User");
const axios = require("axios");
const Sentry = require("@sentry/node");

// 카카오 로그인 URL 제공
exports.kakaoLogin = (req, res) => {
  const REST_API_KEY = process.env.KAKAO_REST_API_KEY;
  const REDIRECT_URI = process.env.KAKAO_REDIRECT_URI;

  const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}`;
  res.redirect(kakaoAuthURL);
};

// 카카오 콜백
exports.kakaoCallback = async (req, res) => {
  const code = req.query.code;

  try {
    // 1. Access Token 요청
    const tokenRes = await axios.post(
      "https://kauth.kakao.com/oauth/token",
      null,
      {
        params: {
          grant_type: "authorization_code",
          client_id: process.env.KAKAO_REST_API_KEY,
          redirect_uri: process.env.KAKAO_REDIRECT_URI,
          code,
          client_secret: process.env.KAKAO_CLIENT_SECRET,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token } = tokenRes.data;

    // 2. 사용자 정보 요청
    const userRes = await axios.get("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const kakaoUser = userRes.data;
    const kakaoId = kakaoUser.id;

    // 3. DB 확인 (회원가입 or 로그인 처리)
    let user = await User.findOne({ kakaoId: kakaoId });

    console.log(kakaoUser);

    if (user) {
      req.session.user = {
        id: user._id,
        role: user.role,
        linked: user.linked,
      };
      //  리디렉션 (앱으로 딥링크 or 웹 페이지)
      return res.redirect(`${process.env.FRONTEND_ORIGIN}/dashboard`); // 프론트 페이지 주소
    } else {
      return res.redirect(
        `${process.env.FRONTEND_ORIGIN}/auth?kakaoId=${kakaoId}`
      ); // 프론트 페이지 주소
    }
  } catch (err) {
    console.error("카카오 로그인 에러:", err.response?.data || err);
    res.status(500).json({ message: "카카오 로그인 실패" });

    Sentry.withScope((scope) => {
      scope.setLevel("error");
      scope.setTag("type", "api");
      scope.setTag("api", "auth");
      Sentry.captureException(err);
    });
  }
};
