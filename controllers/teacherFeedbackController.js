const asyncHandler = require("express-async-handler");
const Feedback = require("../models/Feedback");
const Student = require("../models/Student");
const Class = require("../models/Class");
const mongoose = require("mongoose");
const Sentry = require("@sentry/node");
const transporter = require("../config/mailConfig");
const User = require("../models/User");

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
        select: "name subject",
      });

    // 피드백 내역이 존재하지 않음
    if (!allFeedback || allFeedback.length === 0) {
      return res
        .status(404)
        .json({ message: "해당 학번의 학생의 피드백 내역이 없습니다." });
    }

    //console.log(allFeedback);
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
      teacher_subject: item.teacher?.subject,
    }));
    // 피드백 내역이 존재하지 않음
    if (!refinedFeedbackList || refinedFeedbackList.length === 0) {
      return res
        .status(404)
        .json({ message: "해당 학번의 학생의 피드백 내역이 없습니다." });
    }

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

    // 피드백 카테고리, 제목, 내용이 제공되지 않은 경우
    if (!category || !title || !content) {
      return res
        .status(400)
        .json({ message: "피드백 카테고리, 제목, 내용을 제공해주세요." });
    }

    // 피드백 수정
    feedback.category = category;
    feedback.title = title;
    feedback.content = content;
    // feedback.date = req.body.date;
    const date = new Date().toISOString();
    feedback.date = date; // 현재 날짜로 수정
    await feedback.save();

    const toBeEmail = await User.find({
      linked: student_id,
    }).select("email");

    const _student = await Student.findOne({
      student_id: student_id,
    }).select("name -_id");

    const mailOption = {
      // 해당 선생 이메일로 보내고 싶을 경우
      // from: await User.findOne({ linked: req.session.user.linked[0] }).select("email");
      to: toBeEmail,
      subject: `${_student.name}학생의 ${category} 관련 피드백 내역 수정이 완료되었습니다.`,
      text: `안녕하세요, ${_student.name} 학생, ${category} 관련 피드백 내역이 수정되었습니다.`,
      html: `<p>안녕하세요, ${_student.name} 학생 </p><p>${category} 관련 피드백 내역이 수정되었습니다.</p>`,
    };

    await transporter.sendMail(mailOption);

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

exports.deleteFeedback = asyncHandler(async (req, res) => {
  try {
    const teacher_id = req.session.user.linked[0];
    const student_id = req.params.student_id;
    const feedback_id = req.params.feedback_id;
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

    // 피드백 존재. 피드백의 작성자와 삭제자의 교번이 일치하는지 확인
    if (feedback.teacher_id !== teacher_id) {
      return res.status(403).json({ message: "피드백 삭제 권한이 없습니다." });
    }

    // 피드백 삭제
    await Feedback.findByIdAndDelete(feedback_id);
    // 피드백 삭제 성공
    return res.json({ message: "피드백 삭제 성공" });
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

exports.createFeedback = asyncHandler(async (req, res) => {
  try {
    const teacher_id = req.session.user.linked[0];
    const student_id = req.params.student_id;
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

    // 피드백 카테고리, 제목, 내용이 제공되지 않은 경우
    if (!category || !title || !content) {
      return res
        .status(400)
        .json({ message: "피드백 카테고리, 제목, 내용을 제공해주세요." });
    }
    // 피드백 카테고리, 제목, 내용이 비어있는 경우
    if (
      category.trim() === "" ||
      title.trim() === "" ||
      content.trim() === ""
    ) {
      return res.status(400).json({
        message: "피드백 카테고리, 제목, 내용은 비어있을 수 없습니다.",
      });
    }
    // 현재 학생이 속한 학급을 찾기
    // 피드백 작성 대상 학생 조회
    const theStudent = await Student.findOne({ student_id: student_id });
    if (!theStudent) {
      return res
        .status(404)
        .json({ message: "해당 학번의 학생이 존재하지 않습니다." });
    }

    // 현재 날짜와 그에 해당하는 학기
    const now = new Date();
    const date = new Date().toISOString();
    const month = now.getMonth() + 1; // 월은 0부터 시작하므로 +1
    const semester = month <= 6 ? "firstSemester" : "lastSemester";

    // 피드백 생성
    const newFeedback = new Feedback({
      student_id: student_id,
      teacher_id: teacher_id,
      class_id: theStudent.class_id,
      date: date,
      category: category,
      title: title,
      content: content,
      semester: semester,
    });
    // 피드백 저장
    await newFeedback.save();

    const toBeEmail = await User.find({
      linked: student_id,
    }).select("email");

    const _student = await Student.findOne({
      student_id: student_id,
    }).select("name -_id");

    const mailOption = {
      // 해당 선생 이메일로 보내고 싶을 경우
      // from: await User.findOne({ linked: req.session.user.linked[0] }).select("email");
      to: toBeEmail,
      subject: `${_student.name}학생의 ${category} 관련 새로운 피드백 내역 작성이 완료되었습니다.`,
      text: `안녕하세요, ${_student.name} 학생, ${category} 관련 새로운 피드백 내역이 작성되었습니다.`,
      html: `<p>안녕하세요, ${_student.name} 학생 </p><p>${category} 관련 새로운 피드백 내역이 작성되었습니다.</p>`,
    };

    await transporter.sendMail(mailOption);

    return res.status(201).json({
      message: "피드백 생성 성공",
      feedback: newFeedback,
    });
  } catch (error) {
    console.error("학생 피드백 생성 오류:", error);
    res.status(500).json({ message: "학생 피드백 생성 실패", error });

    Sentry.withScope((scope) => {
      scope.setLevel("error");
      scope.setTag("type", "api");
      scope.setTag("api", "checkAllFeedback");
      Sentry.captureException(error);
    });
  }
});
