const asyncHandler = require("express-async-handler");
const Feedback = require("../models/Feedback");
const Student = require("../models/Student");
const Class = require("../models/Class");
const mongoose = require("mongoose");
const Sentry = require("@sentry/node");

exports.checkAllFeedback = asyncHandler(async (req, res) => {
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
    const student = await Feedback.findOne({ student_id });
    if (!student) {
      return res
        .status(404)
        .json({ message: "해당 학번의 학생이 존재하지 않습니다." });
    }
    // 해당 학번의 학생의 피드백 조회
    const allFeedback = await Feedback.find({ student_id })
      .populate({ path: "class", select: "year" })
      .populate({
        path: "teacher",
        select: "name",
      });

    const refinedFeedbackList = allFeedback.map((item) => ({
      _id: item._id,
      student_id: item.student_id,
      teacher_id: item.teacher_id,
      class_id: item.class_id,
      date: item.date,
      category: item.category,
      title: item.title,
      content: item.content,
      year: item.class?.year, // class.year만 추출해서 최상위에
      semester: item.semester,
      teacher_name: item.teacher?.name, // teacher.name만 추출해서 최상위에
    }));
    console.log(refinedFeedbackList);
    return res.json(refinedFeedbackList);
  } catch (error) {
    console.error("학생 피드백 조회 오류:", error);
    res.status(500).json({ message: "학생 피드백 조회 실패", error });

    Sentry.withScope((scope) => {
      scope.setLevel("error");
      scope.setTag("type", "api");
      scope.setTag("api", "checkAllFeedback");
      Sentry.captureException(error);
    });
  }
});
