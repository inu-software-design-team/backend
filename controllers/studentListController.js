const asyncHandler = require("express-async-handler");
const Class = require("../models/Class");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Sentry = require("@sentry/node");

// 학생 목록 탭 연도 선택지 api
exports.selectYear = asyncHandler(async (req, res) => {
  try {
    const teacher_id = req.session.user.linked[0];

    // 해당 교사가 맡았던 학급들 모두 조회 후 연도 목록 추출
    const classes = await Class.distinct("year", { teacher_id: teacher_id });

    return res.status(200).json({
      message: "학생 목록 탭 연도 선택지입니다.",
      yearSelection: classes,
    });
  } catch (error) {
    console.error("학생 목록 탭 연도 선택 오류:", error);
    res
      .status(500)
      .json({ message: "학생 목록 탭 연도 선택지 불러오기 실패", error });

    Sentry.withScope((scope) => {
      scope.setLevel("error");
      scope.setTag("type", "api");
      scope.setTag("api", "selectYearForStudentsListTab");
      Sentry.captureException(error);
    });
  }
});

// 성적/교사 탭 학생 목록 api
exports.checkAll = asyncHandler(async (req, res) => {
  try {
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
    let selYear = req.params.year;
    // 조회 년도 누락 -> 현재 연도로 조회
    if (!selYear) {
      selYear = 2025;
    }

    // 현재 로그인되어 있는 선생님
    const curteacher = await Teacher.findOne({
      teacher_id: req.session.user.linked[0],
    });

    console.log(req.session.user.linked[0]);

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
    })
      .select("name student_id")
      .populate("class_id", "grade class");

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
