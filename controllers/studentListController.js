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

    // 연도 목록이 비어있을 경우
    if (!classes || classes.length === 0) {
      return res.status(404).json({
        message: "해당 교사가 맡은 학급이 없습니다.",
        yearSelection: [],
      });
    }

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

    // 선택된 연도에 해당하는 학급이 존재하지 않을 경우
    if (!targetClass) {
      return res.status(404).json({
        message: "해당 연도에 해당하는 학급이 존재하지 않습니다.",
      });
    }

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

    // 학생 목록이 비어있을 경우
    if (!students || students.length === 0) {
      return res.status(404).json({
        message: "해당 연도에 해당하는 학급의 학생이 없습니다.",
      });
    }
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

// 학부모 탭 학생 목록 api
exports.checkMyKids = asyncHandler(async (req, res) => {
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

// 학생 탭 학생 목록 api
exports.checkMe = asyncHandler(async (req, res) => {
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

    const linkedIds = req.session.user.linked; // 예: [2001]

    if (!linkedIds || linkedIds.length === 0) {
      return res.status(400).json({ message: "연결된 학생 ID가 없습니다." });
    }

    const student = await Student.findOne({
      student_id: linkedIds[0],
    }).populate("class_id");

    // 학생이 존재하지 않음
    if (!student) {
      return res
        .status(404)
        .json({ message: "해당 학번의 학생이 존재하지 않습니다." });
    }

    console.log(student);

    return res.status(200).json({
      message: "현재 학생의 학급 학생들 정보입니다.",
      data: {
        studentsList: student, // 학생들의 objectId/학번/이름
      },
    });
  } catch (error) {
    console.error("학생 목록 오류:", error);
    res.status(500).json({ message: "학생 목록 불러오기 실패", error });

    Sentry.withScope((scope) => {
      scope.setLevel("error");
      scope.setTag("type", "api");
      scope.setTag("api", "checkStudent");
      Sentry.captureException(error);
    });
  }
});
