const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Teacher = require("../models/Teacher");
const Parent = require("../models/Parent");
const Student = require("../models/Student");
const Class = require("../models/Class");
const Score = require("../models/Score");
const transporter = require("../config/mailConfig");
const Sentry = require("@sentry/node");

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

//학생 탭 특정 학생 성적 조회 api
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
    const theStudent = await Student.findOne({ student_id });
    if (!theStudent) {
      return res
        .status(404)
        .json({ message: "해당 학번의 학생이 존재하지 않습니다." });
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
      return res.status(400).json({ message: "연도는 숫자여야 합니다." });
    }
    // 해당 연도의 해당 학생 성적
    const studentGrade = await Score.findOne({
      student_id: student_id,
      year: year,
    });
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
