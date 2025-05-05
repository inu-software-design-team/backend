const asyncHandler = require("express-async-handler");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const Class = require("../models/Class");
const Score = require("../models/Score");
// 성적/교사 탭 학생 목록 api
exports.checkAll = asyncHandler(async (req, res) => {
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
  // 세션 존재 및 유효
  // 조회하고자 하는 연도
  const selYear = req.body.year;
  // 조회 년도 누락 -> 현재 연도로 조회
  if (!selYear) {
    selYear = 2025;
  }

  // 현재 로그인되어 있는 선생님
  const curteacher = await Teacher.findOne({
    teacher_id: req.session.user.linked[0],
  });

  // 조회하고자 하는 학급
  const targetClass = await Class.findOne({
    teacher_id: curteacher.teacher_id,
    year: selYear,
  });

  console.log(targetClass);

  // 학급 학생들 모두 조회
  let students = await Student.find({
    $or: [
      { class_id: targetClass._id },
      { class_history: { $in: [targetClass._id] } },
    ],
  }).select("name student_id");

  console.log(students);

  return res.status(200).json({
    message: "현재 교사의 선택한 연도의 학급, 학급 학생들 정보입니다.",
    data: {
      class_id: targetClass._id, // 조회하고자 하는 학급 id(이후 특정 학생 성적 조회에 사용할때 req.body에 담아서 요청해야함)
      grade: targetClass.grade, // 학년
      class: targetClass.class, // 반
      studentsList: students, // 학생들의 objectId/학번/이름
    },
  });
});

// 성적/교사 탭 특정 학생 성적 조회 api
exports.checkGrade = asyncHandler(async (req, res) => {
  // 조회하고자 하는 학생의 학번
  const student_id = req.params.studentId;
  // 조회하고자 하는 학급
  const classId = req.body.class_id;
  // 조회하고자 하는 학생의 학기
  const selSemeseter = req.body.semeseter;
  // 현재 로그인되어 있는 선생님
  const curteacher = await Teacher.findOne({
    teacher_id: req.session.user.linked[0],
  });
  // 조회하고자 하는 학생의 학급
  const targetClass = await Class.findOne({
    _id: classId,
  });
  // 학기별 조회
  const semesterId =
    selSemeseter === 1
      ? targetClass.semesters_id[0]
      : targetClass.semesters_id[1];
  // 해당 학생의 성적
  const studentGrade = await Score.findOne({
    class_id: targetClass._id, // 학급
    teacher_id: curteacher.teacher_id, // 담임교사
    semester_id: semesterId, // 학기
    student_id: student_id, // 학생
  });

  return res.status(200).json({
    message: "현재 학생의 성적입니다.",
    data: {
      // 학생의 성적. total_score, avrage 그리고 각 모든 과목들의 성적들은 중간/기말을 구분하기 위해 배열로 저장되어 있음
      student_id: student_id,
      grade: studentGrade,
    },
  });
});
