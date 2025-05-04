const asyncHandler = require("express-async-handler");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const Class = require("../models/Class");
const Score = require("../models/Score");
const Semester = require("../models/Semester");

// 성적/교사 탭 학생 목록 api
exports.checkAll = asyncHandler(async (req, res) => {
  // 조회하고자 하는 연도
  const selYear = req.body.year;
  // 조회 년도 누락 -> 현재 연도로 조회
  if (selYear == null) {
    selYear = 2025;
  }

  // 현재 로그인되어 있는 선생님
  const curteacher = await Teacher.findOne({
    teacher_id: req.session.user.linked[0],
  });

  // 해당 선생님이 담당했던 모든 학급 조회
  const classes = await Class.find({ teacher_id: curteacher.teacher_id });

  // 1/2학기 배열
  let semesters = [];

  // 조회된 학급들의 first/finalSemester_id를 사용해 1/2학기 조회
  for (const cls of classes) {
    // 1학기
    const first = await Semester.findOne({
      _id: cls.firstSemester_id,
      year: selYear,
      session: 1,
    });
    // 2학기
    const second = await Semester.findOne({
      _id: cls.secondSemester_id,
      year: selYear,
      session: 2,
    });
    // 1/2학기 배열에 추가
    if (first) semesters.push(first);
    if (second) semesters.push(second);
  }

  // 조회하고자 하는 연도의 학급
  const targetClass = await Class.findOne({
    first_semester_id: semesters[0]._id,
    second_semester_id: semesters[1]._id,
  });

  // 해당 학급의 모든 학생. 학생들의 학번/이름 받아옴
  const students = await Student.find({ class_id: targetClass._id }).select(
    "student_id name"
  );

  return res.status(200).json({
    message: "현재 교사 담당 학급, 학급 학생들, 현재 학기 정보입니다.",
    data: {
      class_id: targetClass._id, // 조회하고자 하는 학급 id(이후 특정 학생 성적 조회에 사용할때 req.body에 담아서 요청해야함)
      grade: targetClass.grade,
      class: targetClass.class, // 학년 반
      studentsList: students, // 학생들의 학번/이름
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
