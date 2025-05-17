const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const Class = require("../models/Class");
const Score = require("../models/Score");

// 성적/교사 탭 학생 목록 api
exports.fetchInformation = asyncHandler(async (req, res) => {
  const studentId = req.params.student_id;
  console.log(studentId);

  try {
    const student = await Student.findOne({
      student_id: studentId,
    }).populate({
      path: "class_id", // 1단계: class 문서
      populate: {
        path: "teacher", // 2단계: class 내부의 teacher_id 필드
        model: "Teacher",
      },
    });

    if (!student) {
      return res.status(404).json({ message: "학생을 찾을 수 없습니다." });
    }

    console.log(student);

    res.status(200).json({
      student_id: student.student_id,
      name: student.name,
      gender: student.gender,
      registration_number: student.registration_number,
      class: {
        teacher_name: student.class_id?.teacher?.name || null,
        grade: student.class_id?.grade || null,
        class: student.class_id?.class || null,
        year: student.class_id?.year || null,
      },
    });
  } catch (error) {
    console.error("학생 목록 오류:", error);
    res.status(500).json({ message: "학생 목록 불러오기 실패", error });

    Sentry.withScope((scope) => {
      scope.setLevel("error");
      scope.setTag("type", "api");
      scope.setTag("api", "checkFetchInformation");
      Sentry.captureException(error);
    });
  }
});
