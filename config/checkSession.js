const publicPaths = [
  "/users/sign-up",
  "/users/kakao/login",
  "/users/csrf-Token",
  "/users/check-Id",
];

module.exports = function checkSession(req, res, next) {
  // 예외 경로는 검사 없이 통과

  if (publicPaths.includes(req.path.replace(/\/$/, ""))) {
    return next();
  }

  if (!req.session || !req.session.user) {
    return res
      .status(400)
      .json({ message: "세션이 존재하지 않음/로그인 되어있지 않음" });
  }

  if (req.session.cookie && req.session.cookie.expires) {
    if (new Date(req.session.cookie.expires) < new Date()) {
      return res.status(400).json({ message: "세션이 만료됨" });
    }
  }

  next();
};
