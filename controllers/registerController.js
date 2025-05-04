const User = require("../models/User");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const Parent = require("../models/Parent");
const bcrypt = require("bcryptjs");
const Sentry = require("@sentry/node");

//회원가입
exports.register = async (req, res) => {
  try {
    const { email, password, role, number } = req.body; //number는 배열값입니다!

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ message: "아이디는 유효한 이메일 형식이어야 합니다." });
    }

    if (typeof password != "string" || password.length < 10) {
      return res.status(400).json({
        message: "비밀번호는 10자 이상의 문자열이어야 합니다.",
      });
    }

    if (!email || !password || !role || !number) {
      return res.status(400).json({
        message: "아이디, 비밀번호, 역할, 고유번호를 모두 입력하세요.",
      });
    }

    // 이메일 중복 체크
    const existingUser = await User.findOne({ identifier: email });
    if (existingUser) {
      return res.status(400).json({ message: "이미 가입된 이메일입니다." });
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    let newUser = null;

    if (role === "teacher") {
      // 교사 테이블에서 교번으로 먼저 조회
      const idToCheck = number[0]; // 배열의 0번째 값만 확인
      const teacher = await Teacher.findOne({ teacher_id: idToCheck });
      if (teacher == null) {
        return res
          .status(400)
          .json({ message: "해당하는 교사 정보가 없습니다." });
      }
      newUser = new User({
        identifier: email,
        password: hashedPassword,
        role: role,
        linked: number[0],
      });
    } else if (role === "student") {
      // 학생 테이블에서 교번으로 먼저 조회
      const idToCheck = number[0]; // 배열의 0번째 값만 확인
      const student = await Student.findOne({ student_id: idToCheck });
      if (student == null) {
        return res
          .status(400)
          .json({ message: "해당하는 학생 정보가 없습니다." });
      }
      newUser = new User({
        identifier: email,
        password: hashedPassword,
        role: role,
        linked: number[0],
      });
    } else if (role === "parent") {
      // 부모 테이블에서 자녀 학번 배열로 먼저 조회
      const idToCheck = number; // 배열 통째로 조회
      const parent = await Parent.findOne({ child_id: { $eq: idToCheck } });
      if (parent == null) {
        return res
          .status(400)
          .json({ message: "해당하는 부모 정보가 없습니다." });
      }
      newUser = new User({
        identifier: email,
        password: hashedPassword,
        role: role,
        linked: number,
      });
    } else {
      return res.status(400).json({ message: "잘못된 회원 타입입니다." });
    }

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
};

//역할검증
exports.checkId = async (req, res) => {
  try {
    const { role, number, name } = req.body;

    if (!role || !number || !name) {
      return res
        .status(400)
        .json({ message: "역할, 번호, 이름을 모두 입력해주세요." });
    }

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

      return res.status(200).json({ message: "교사 인증 성공" });
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

      return res.status(200).json({ message: "학생 인증 성공" });
    } else if (role === "parent") {
      const parent = await Parent.findOne({
        child: number,
      });

      if (!parent) {
        return res
          .status(400)
          .json({ message: "일치하는 학부모 정보가 없습니다." });
      }

      return res.status(200).json({ message: "학부모 인증 성공" });
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
      Sentry.captureException(err);
    });
  }
};

// 로그인
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ identifier: email });
    if (!user)
      return res.status(400).json({ message: "존재하지 않는 이메일입니다." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });

    //세션 객체(req.session) 안에 user라는 키를 만들어서, 그 안에 유저 정보를 저장해주는 거야.즉, 세션을 통해 로그인된 유저의 정보를 유지
    req.session.user = {
      id: user._id,
      email: user.identifier,
      role: user.role,
      linked: user.linked,
    };
    console.log("현재 세션:", req.session);

    res.status(200).json({
      message: "로그인 성공",
      user: req.session.user,
    });
  } catch (error) {
    console.error("로그인 오류:", error);
    res.status(500).json({ message: "로그인 실패", error });
    Sentry.withScope((scope) => {
      scope.setLevel("error");
      scope.setTag("type", "api");
      scope.setTag("api", "login");
      Sentry.captureException(err);
    });
  }
};

exports.mainInfo = async (req, res) => {
  switch (req.session.user.role) {
    case "student":
      const student = await Student.findById(req.session.user.linked[0]);
      return res.status(200).json(student.name);
    case "teacher":
      const teacher = await Teacher.findById(req.session.user.linked[0]);
      return res.status(200).json(teacher.name);
    case "parent":
      const parent = await Parent.findById(req.session.user.linked);
      return res.status(200).json(parent.name);
    default:
      return res.status(400).json({ message: "잘못된 접근입니다." });
  }
};
