const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Teacher = require("../models/Teacher");
const Parent = require("../models/Parent");
const Student = require("../models/Student");
const Class = require("../models/Class");
const Score = require("../models/Score");
const transporter = require("../config/mailConfig");
const Sentry = require("@sentry/node");

// 학부모 탭 학생 목록 api
exports.checkAll = asyncHandler(async (req, res) => {
  try {
    /*
    // 세션이 존재하지 않음
    if (!req.session || !req.session.user) {
      return res
        .status(400)
        .json({ message: "세션이 존재하지 않음/로그인 되어있지 않음" });
    }
    // 세션 만료됨
    if (new Date(req.session.cookie.expires) < new Date()) {
      return res.status(400).json({ message: "세션이 만료됨" });
    }
    */

    const linkedIds = req.session.user.linked; // 예: [2001]

    // 학부모 조회
    const parent = await Parent.findOne({ linked: linkedIds });

    // 학부모가 존재하지 않음
    if (!parent) {
      return res.status(404).json({
        message: "해당 학부모가 존재하지 않습니다.",
      });
    }
    // 학부모가 자녀의 학번을 가지고 있지 않음
    if (parent.linked.length === 0) {
      return res.status(404).json({
        message: "해당 학부모의 자녀가 존재하지 않습니다.",
      });
    }

    const students = await Student.find({
      student_id: { $in: linkedIds },
    }).populate("class_id"); // 필요한 필드만

    // 학생이 존재하지 않음
    if (!students || students.length === 0) {
      return res.status(404).json({
        message: "해당 학부모의 자녀가 존재하지 않습니다.",
      });
    }

    console.log(students);

    return res.status(200).json({
      message: "현재 학부모의 학급 학생들 정보입니다.",
      data: {
        studentsList: students, // 학생들의 objectId/학번/이름
      },
    });
  } catch (error) {
    console.error("학생 목록 오류:", error);
    res.status(500).json({ message: "학생 목록 불러오기 실패", error });

    Sentry.withScope((scope) => {
      scope.setLevel("error");
      scope.setTag("type", "api");
      scope.setTag("api", "checkAllStudents");
      Sentry.captureException(error);
    });
  }
});

//학생 성적 연도 선택
exports.selectYearForGrade = asyncHandler(async (req, res) => {
  try {
    const student_id = req.params.student_id;

    // 학번이 제공되지 않음
    if (!student_id) {
      return res.status(400).json({ message: "학생 학번을 제공해주세요." });
    }

    // 학번이 숫자가 아님
    if (isNaN(student_id)) {
      return res
        .status(400)
        .json({ message: "학생의 학번은 숫자여야 합니다." });
    }

    // 해당 학번의 학생이 존재하지 않음
    const theStudent = await Student.findOne({ student_id });
    if (!theStudent) {
      return res
        .status(404)
        .json({ message: "해당 학번의 학생이 존재하지 않습니다." });
    }

    // 해당 학생의 모든 성적 컬렉션 조회 후 연도 목록 추출
    const allGrades = await Score.distinct("year", { student_id: student_id });

    // 학생 성적이 존재하지 않음
    if (!allGrades || allGrades.length === 0) {
      return res
        .status(404)
        .json({ message: "해당 학생의 성적이 존재하지 않습니다." });
    }

    return res.status(200).json({
      message: `${student_id} 학생의 성적 연도 목록입니다.`,
      yearSelection: allGrades,
    });
  } catch (error) {
    console.error("학생 성적 조회 연도 선택 오류:", error);
    res
      .status(500)
      .json({ message: "학생 성적 조회 연도 선택지 불러오기 실패", error });

    Sentry.withScope((scope) => {
      scope.setLevel("error");
      scope.setTag("type", "api");
      scope.setTag("api", "selectYearForStudentGrade");
      Sentry.captureException(error);
    });
  }
});

// 성적/학부모 탭 특정 학생 성적 조회 api
exports.checkGrade = asyncHandler(async (req, res) => {
  try {
    const student_id = req.params.student_id;

    // 학번이 제공되지 않음
    if (!student_id) {
      return res.status(400).json({ message: "학생 학번을 제공해주세요." });
    }
    // 학번이 숫자가 아님
    if (isNaN(student_id)) {
      return res
        .status(400)
        .json({ message: "학생의 학번은 숫자여야 합니다." });
    }
    // 해당 학번의 학생이 존재하지 않음
    const theStudent = await Student.findOne({ student_id: student_id });
    if (!theStudent) {
      return res
        .status(400)
        .json({ message: "해당 학번의 학생이 존재하지 않습니다." });
    }
    // 해당 학생의 학부모가 존재하지 않음
    const theParent = await Parent.findOne({ linked: student_id });
    if (!theParent) {
      return res.status(400).json({
        message: "해당 학번의 학생의 학부모가 존재하지 않습니다.",
      });
    }

    // 조회하고자 하는 연도
    const year = req.params.year;
    // 연도가 제공되지 않음
    if (!year) {
      return res
        .status(400)
        .json({ message: "조회하고자 하는 연도를 제공해주세요." });
    }
    // 연도가 숫자가 아님
    if (isNaN(year)) {
      return res
        .status(400)
        .json({ message: "조회하고자 하는 연도는 숫자여야 합니다." });
    }
    // 해당 연도의 해당 학생 성적
    const studentGrade = await Score.findOne({
      student_id: student_id,
      year: year,
    });
    // 해당 연도의 해당 학생 성적이 존재하지 않음
    if (!studentGrade) {
      return res.status(400).json({
        message: "해당 연도의 해당 학생 성적이 존재하지 않습니다.",
      });
    }

    return res.status(200).json({
      message: "현재 학생의 성적입니다.",
      data: {
        // 학생의 성적. total_score, avrage 그리고 각 모든 과목들의 성적들은 중간/기말을 구분하기 위해 배열로 저장되어 있음
        student_id: student_id,
        grade: studentGrade,
      },
    });
  } catch (error) {
    console.error("학생 성적 조회 오류:", error);
    res.status(500).json({ message: "학생 성적 조회 실패", error });

    Sentry.withScope((scope) => {
      scope.setLevel("error");
      scope.setTag("type", "api");
      scope.setTag("api", "checkStudentGrade");
      Sentry.captureException(error);
    });
  }
});
