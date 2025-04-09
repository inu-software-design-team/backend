const User = require("../models/User");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const Parent = require("../models/Parent");
const bcrypt = require("bcryptjs");

//회원가입
exports.register = async (req, res) => {
  try {
    const { email, password, role, number } = req.body; //number는 배열값입니다!

    // 이메일 중복 체크
    const existingUser = await User.findOne({ identifier: email });
    if (existingUser) {
      return res.status(400).json({ message: "이미 가입된 이메일입니다." });
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = null;

    // 유저 생성
    if (role == "teacher" || role == "student") {
      newUser = new User({
        identifier: email,
        password: hashedPassword,
        role: role,
        linked: number[0],
      });
    } else if (role == "parent") {
      newUser = new User({
        identifier: email,
        password: hashedPassword,
        role: role,
        linked: number,
      });
    }

    await newUser.save();

    res.status(201).json({ message: "회원가입 성공!" });
  } catch (error) {
    res.status(500).json({ message: "회원가입 실패", error });
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
  }
};

// 로그인
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 유저 존재 여부 확인
    const user = await User.findOne({ identifier: email });
    if (!user) {
      return res.status(400).json({ message: "존재하지 않는 이메일입니다." });
    }

    // 비밀번호 비교
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    // JWT 토큰 발급 (선택사항)
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || "your_jwt_secret", // 환경변수에서 비밀키를 가져옴
      { expiresIn: "7d" } // 7일간 유효
    );

    // 성공 응답
    res.status(200).json({
      message: "로그인 성공!",
      user: {
        id: user._id,
        email: user.identifier,
        role: user.role,
        linked: user.linked,
      },
      token, // 프론트에서 Authorization 헤더로 보낼 수 있음
    });
  } catch (error) {
    res.status(500).json({ message: "로그인 실패", error });
  }
};
