const asyncHandler = require("express-async-handler");
const Feedback = require("../models/Feedback");
const mongoose = require("mongoose");

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

exports.modifyFeedback = asyncHandler(async (req, res) => {
  try {
    const teacher_id = req.session.user.linked[0];
    const student_id = req.params.student_id;
    const feedback_id = req.params.feedback_id;
    const { category, title, content } = req.body;

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
    // 피드백 ID가 제공되지 않은 경우
    if (!feedback_id) {
      return res.status(400).json({ message: "피드백 ID를 제공해주세요." });
    }

    // 피드백 ID가 유효하지 않은 경우
    if (!mongoose.Types.ObjectId.isValid(feedback_id)) {
      return res
        .status(400)
        .json({ message: "유효하지 않은 피드백 ID입니다." });
    }

    // 피드백 ID에 해당하는 피드백이 존재하지 않는 경우
    const feedback = await Feedback.findById(feedback_id);
    if (!feedback) {
      return res
        .status(404)
        .json({ message: "해당 피드백이 존재하지 않습니다." });
    }

    // console.log("로그인 교사 교번: ", teacher_id, "피드백 작성자 교번: ", feedback.teacher_id);
    // 피드백 존재. 피드백의 작성자와 수정자의 교번이 일치하는지 확인
    if (feedback.teacher_id !== teacher_id) {
      return res.status(403).json({ message: "피드백 수정 권한이 없습니다." });
    }

    // 피드백 수정
    feedback.category = category;
    feedback.title = title;
    feedback.content = content;
    await feedback.save();
    // 피드백 수정 성공
    return res.json({ message: "피드백 수정 성공", updatedFeedback: feedback });
  } catch (error) {
    console.error("학생 피드백 수정 오류:", error);
    res.status(500).json({ message: "학생 피드백 수정 실패", error });

    Sentry.withScope((scope) => {
      scope.setLevel("error");
      scope.setTag("type", "api");
      scope.setTag("api", "checkAllFeedback");
      Sentry.captureException(error);
    });
  }
});
