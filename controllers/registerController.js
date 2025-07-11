const User = require("../models/User");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const Parent = require("../models/Parent");
const Sentry = require("@sentry/node");
const validator = require("email-validator");
const asyncHandler = require("express-async-handler");

// 정보입력
exports.register = asyncHandler(async (req, res) => {
  try {
    const { kakaoId, linked, role, email, phone, address } = req.body; //number는 배열값입니다!

    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = validator(email);
    /*
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ message: "유효한 이메일 형식이어야 합니다." });
    }
    */
    if (!isValid) {
      return res
        .status(400)
        .json({ message: "유효한 이메일 형식이어야 합니다." });
    }

    if (typeof phone != "string") {
      return res.status(400).json({
        message: "전화번호는 문자열이어야 합니다.",
      });
    }

    if (typeof address != "string") {
      return res.status(400).json({
        message: "주소는 문자열이어야 합니다.",
      });
    }

    if (!email || !address || !role || !linked || !phone) {
      return res.status(400).json({
        message: "이메일, 전화번호, 주소, 역할을 모두 입력하세요.",
      });
    }

    // 이메일 중복 체크
    const existingEmail = await User.findOne({ identifier: email });
    if (existingEmail) {
      return res.status(400).json({ message: "이미 가입된 이메일입니다." });
    }

    // 전화번호 중복 체크
    const existingPhone = await User.findOne({ phone: phone });
    if (existingPhone) {
      return res.status(400).json({ message: "이미 가입된 전화번호입니다." });
    }

    let newUser = null;
    // 유저 생성
    newUser = new User({
      kakaoId: kakaoId,
      linked: linked,
      role: role,
      email: email,
      phone: phone,
      address: address,
    });
    await newUser.save();
    res.status(201).json({ message: "회원가입 성공!" });
  } catch (error) {
    console.error("회원가입 에러:", error); // 이거 꼭 추가
    res.status(500).json({ message: "회원가입 실패", error });

    Sentry.withScope((scope) => {
      scope.setLevel("error");
      scope.setTag("type", "api");
      scope.setTag("api", "signup");
      Sentry.captureException(error);
    });
  }
});

//역할검증
exports.checkId = asyncHandler(async (req, res) => {
  try {
    const { role, number, name } = req.body; // Number는 배열이어야 함!!

    if (!role || !number || !name) {
      return res
        .status(400)
        .json({ message: "역할, 번호, 이름을 모두 입력해주세요." });
    }
    // req.body 에서 받아온 number가 배열이 아님
    if (!Array.isArray(number) || !number.every((n) => typeof n === "number")) {
      return res.status(400).json({
        message: "number는 숫자 배열 형식이어야 합니다.",
      });
    }
    // req,body에서 받아온 role이 string이 아님
    if (typeof role != "string") {
      return res.status(400).json({
        message: "role은 string 형식이어야 합니다.",
      });
    }
    // req.body에서 받아온 name이 string이 아님
    if (typeof name != "string") {
      return res.status(400).json({
        message: "name은 string 형식이어야 합니다.",
      });
    }

    // 역할 검사
    if (role === "teacher") {
      const idToCheck = number[0]; // 배열의 0번째 값만 확인
      const teacher = await Teacher.findOne({
        teacher_id: idToCheck,
        name: name,
      });

      if (!teacher) {
        return res
          .status(400)
          .json({ message: "일치하는 교사 정보가 없습니다." });
      }

      return res
        .status(200)
        .json({ message: "교사 인증 성공", role: "teacher", linked: number });
    } else if (role === "student") {
      const idToCheck = number[0]; // 배열의 0번째 값만 확인
      const student = await Student.findOne({
        student_id: idToCheck,
        name: name,
      });

      if (!student) {
        return res
          .status(400)
          .json({ message: "일치하는 학생 정보가 없습니다." });
      }

      return res
        .status(200)
        .json({ message: "학생 인증 성공", role: "student", linked: number });
    } else if (role === "parent") {
      const parent = await Parent.findOne({
        child_id: { $eq: number },
      });

      if (!parent) {
        return res
          .status(400)
          .json({ message: "일치하는 학부모 정보가 없습니다." });
      }

      return res
        .status(200)
        .json({ message: "학부모 인증 성공", role: "parent", linked: number });
    } else {
      return res.status(400).json({ message: "잘못된 역할입니다." });
    }
  } catch (error) {
    console.error("checkId 오류:", error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
    Sentry.withScope((scope) => {
      scope.setLevel("error");
      scope.setTag("type", "api");
      scope.setTag("api", "roleCheck");
      Sentry.captureException(error);
    });
  }
});

// 로그인
exports.login = asyncHandler(async (req, res) => {
  try {
    const { kakaoId } = req.body;

    // 카카오 ID가 제공되지 않음
    if (!kakaoId) {
      return res
        .status(400)
        .json({ message: "카카오 ID가 제공되지 않았습니다." });
    }
    // 유저 조회
    const _user = await User.findOne({ kakaoId });
    if (_user) {
      //세션 객체(req.session) 안에 user라는  키를 만들어서, 그 안에 유저 정보를 저장해주는 거야.즉, 세션을 통해 로그인된 유저의 정보를 유지
      req.session.user = {
        id: _user._id,
        role: _user.role,
        linked: _user.linked,
      };

      console.log("현재 세션:", req.session);

      return res.status(200).json({
        message: "로그인 성공",
        user: req.session.user,
      });
    } else {
      return res.status(400).json({ message: "가입되지 않은 유저입니다" });
    }
  } catch (error) {
    console.error("로그인 오류:", error);
    res.status(500).json({ message: "로그인 실패", error });
    Sentry.withScope((scope) => {
      scope.setLevel("error");
      scope.setTag("type", "api");
      scope.setTag("api", "login");
      Sentry.captureException(error);
    });
  }
});

// 로그아웃
exports.logout = asyncHandler(async (req, res) => {
  try {
    if (req.session) {
      console.log(req.session);
      // 1. 서버 측 세션 데이터 파기
      req.session.destroy((err) => {
        if (err) {
          // 세션 파기 중 오류 발생 시
          console.error("세션 파기 오류:", err);
          return res.status(500).send("로그아웃 중 오류가 발생했습니다.");
        } else {
          console.log("sdfsdfsdfsd");

          res.clearCookie("connect.sid", {
            path: "/", // express-session의 기본 쿠키 경로
            httpOnly: true,
            secure: false, // 배포 환경에서는 true (https만 될지)
            sameSite: "lax",
          });
          res
            .status(200)
            .send(
              "성공적으로 로그아웃되었으며 세션 쿠키가 삭제 요청되었습니다."
            );
        }
      });
    } else {
      // 이미 세션이 없는 경우
      res.status(200).send("활성화된 세션이 없습니다.");
    }
  } catch (error) {
    console.error("로그아웃 오류:", error);
    res.status(500).json({ message: "로그아웃 실패", error });
    Sentry.withScope((scope) => {
      scope.setLevel("error");
      scope.setTag("type", "api");
      scope.setTag("api", "logout");
      Sentry.captureException(error);
    });
  }
});

exports.mainInfo = asyncHandler(async (req, res) => {
  switch (req.session.user.role) {
    case "student":
      const student = await Student.findOne({
        student_id: req.session.user.linked[0],
      }).select("name -_id");
      return res.status(200).json({ name: student.name });
    case "teacher":
      const teacher = await Teacher.findOne({
        teacher_id: req.session.user.linked[0],
      }).select("name -_id");
      return res.status(200).json({ name: teacher.name });
    case "parent":
      const parent = await Parent.findOne({
        chlid_id: req.session.user.linked,
      }).select("name -_id");
      return res.status(200).json({ name: parent.name });
    default:
      return res.status(400).json({ message: "잘못된 접근입니다." });
  }
});
