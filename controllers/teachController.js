const asyncHandler = require("express-async-handler");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const Class = require("../models/Class");
const semester = require("../models/semester");

// 성적/교사 탭 학생 목록 api
exporsts.checkAll = asyncHandler(async (req, res) => {
  // 현재 로그인되어 있는 선생님
  const curteacher = await Teacher.findOne({
    teacher_id: req.session.user.linked[0],
  });
  // 해당 선생님의 학급. 해당 학급 담당 교사의 학년 반 받아옴
  const myClass = await Class.find({ teacher_id: curteacher.teacher_id });
  // 학급의 현재 학기
  const semester = await semester.findOne(
    { _id: myClass.semester_id }.select("name student_id")
  );

  // 해당 학급의 모든 학생. 학생들의 이름 받아옴
  const students = await Student.find({ class_id: myClass.id });

  return res.status(200).json({
    message: "현재 교사 담당 학급, 학급 학생들, 현재 학기 정보입니다.",
    data: {
      myClass: { grade: myClass.grade, class: myclass.class },
      stdentsList: students,
    },
  });
});
