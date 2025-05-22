const asyncHandler = require("express-async-handler");
const Counseling = require("../models/Counseling");
const Student = require("../models/Student");
const Class = require("../models/Class");

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
    // console.log("상담 내역:", allCounseling);

    // 상담 내역이 존재하지 않을 경우
    if (!allCounseling || allCounseling.length === 0) {
      return res.status(404).json({ message: "상담 내역이 없습니다." });
    }
    // 상담 내역이 존재할 경우
    // 상담 내역을 가공하여 필요한 정보만 추출
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
