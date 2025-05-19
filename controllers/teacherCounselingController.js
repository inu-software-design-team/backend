const asyncHandler = require("express-async-handler");
const Counseling = require("../models/Counseling");
const Student = require("../models/Student");

exports.checkAllCounseling = asyncHandler(async (req, res) => {
  try {
    const student_id = req.params.student_id;

    // 학생의 학번이 제공되지 않은 경우
    if (!student_id) {
      return res.status(400).json({ message: "학생 학번을 제공해주세요." });
    }

    // 학생의 학번이 숫자가 아닌 경우
    if (isNaN(student_id)) {
      return res
        .status(400)
        .json({ message: "학생의 학번은 숫자여야 합니다." });
    }

    // 해당 학번의 학생이 존재하지 않음
    const theStudent = await Student.findOne({ student_id: student_id });
    if (!theStudent) {
      return res
        .status(404)
        .json({ message: "해당 학번의 학생이 존재하지 않습니다." });
    }

    // 모든 상담 내역 조회
    const allCounseling = await Counseling.find({
      student_id: student_id,
    })
      .populate({ path: "class", select: "year" })
      .populate({
        path: "teacher",
        select: "name",
      });

    const refinedCounselingList = allCounseling.map((item) => ({
      _id: item._id,
      class_id: item.class_id,
      student_id: item.student_id,
      teacher_id: item.teacher_id,
      date: item.date,
      topic: item.topic,
      title: item.title,
      content: item.content,
      next_date: item.next_date,
      next_content: item.next_content,
      year: item.class?.year, // class.year만 추출해서 최상위에
      semester: item.semester,
      teacher_name: item.teacher?.name, // teacher.name만 추출해서 최상위에
    }));

    // 상담 내역이 존재하지 않을 경우
    if (!refinedCounselingList || refinedCounselingList.length === 0) {
      return res.status(404).json({ message: "상담 내역이 없습니다." });
    }

    // 상담 내역이 존재할 경우
    return res.status(200).json({
      message: `${student_id}의 상담 내역입니다.`,
      refinedCounselingList,
    });
  } catch (error) {
    console.error("학생 상담 조회 오류:", error);
    res.status(500).json({ message: "학생 상담 조회 실패", error });

    Sentry.withScope((scope) => {
      scope.setLevel("error");
      scope.setTag("type", "api");
      scope.setTag("api", "checkAllCounseling");
      Sentry.captureException(error);
    });
  }
});

/* 
exports.createCounseling = asyncHandler(async (req, res) => {
  try {
    const student_id = req.params.user_id;
    const teacher_id = req.session.user.linked[0];
    const topic = req.body.topic;
    const title = req.body.title;
    const content = req.body.content;
    const next_date = req.body.next_date;
    const next_content = req.body.next_content;

    const date = new Date();
    // 학기 설정
    const month = date.getMonth() + 1; // 월은 0부터 시작하므로 +1
    const semester = month <= 6 ? "firstSemester" : "finalSemester";
    // 작성자 교사가 현재 담당하는 학급 조회(상담 대상 학생의 학급)
    const year = date.getFullYear();
    const theClass = await Class.findOne({
      teacher_id: teacher_id,
      year: year,
    });

    const newCounseling = new Counseling({
      class_id: theClass._id,
      student_id: student_id,
      teacher_id: teacher_id,
      date: date,
      topic: topic,
      title: title,
      content: content,
      next_date: next_date,
      next_content: next_content,
      semester: semester,
    });
  } catch (error) {
    console.error("학생 상담 생성 오류:", error);
    res.status(500).json({ message: "학생 상담 생성 실패", error });

    Sentry.withScope((scope) => {
      scope.setLevel("error");
      scope.setTag("type", "api");
      scope.setTag("api", "createCounseling");
      Sentry.captureException(error);
    });
  }
});
*/
