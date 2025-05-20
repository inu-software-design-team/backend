const asyncHandler = require("express-async-handler");
const Counseling = require("../models/Counseling");
const Student = require("../models/Student");
const Class = require("../models/Class");
const User = require("../models/User");
const mongoose = require("mongoose");
const transporter = require("../config/mailConfig");
const Sentry = require("@sentry/node");

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

exports.createCounseling = asyncHandler(async (req, res) => {
  try {
    const student_id = req.params.student_id;
    const teacher_id = req.session.user.linked[0];
    const topic = req.body.topic;
    const title = req.body.title;
    const content = req.body.content;
    const next_date = req.body.next_date;
    const next_content = req.body.next_content;

    const now = new Date();
    const date = new Date().toISOString().slice(0, 10);
    // 학기 설정
    const month = now.getMonth() + 1; // 월은 0부터 시작하므로 +1
    const semester = month <= 6 ? "firstSemester" : "finalSemester";
    // 작성자 교사가 현재 담당하는 학급 조회(상담 대상 학생의 학급)
    const year = now.getFullYear();
    const theClass = await Class.findOne({
      teacher_id: teacher_id,
      year: year,
    });
    // 해당 학급이 존재하지 않음
    if (!theClass) {
      return res.status(404).json({
        message:
          "학생이 속한, 현재 로그인한 교사가 담당하는 학급이 존재하지 않습니다.",
      });
    }
    // 새로운 상담 생성
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
    // 상담 내역 저장
    await newCounseling.save();

    // 상담 내역 작성 메일 전송
    // 새로운 상담 내역이 작성된 학생 유저/해당 학생의 학부모의 메일 조회
    const toBeEmail = await User.find({
      linked: student_id,
    }).select("email");

    const _student = await Student.findOne({
      student_id: student_id,
    }).select("name -_id");

    const mailOption = {
      to: toBeEmail,
      subject: `${_student.name}학생의 ${topic} 관련 새로운 상담 내역 작성이 완료되었습니다.`,
      text: `안녕하세요, ${_student.name} 학생, ${topic} 관련 새로운 상담 내역이 작성되었습니다.`,
      html: `<p>안녕하세요, ${_student.name} 학생 </p><p>${topic} 관련 새로운 상담 내역이 작성되었습니다.</p>`,
    };

    await transporter.sendMail(mailOption);

    return res.status(201).json({
      message: "새로운 상담 내역이 생성되었습니다.",
      newCounseling,
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

// 상담 내역 수정
exports.modifyCounseling = asyncHandler(async (req, res) => {
  try {
    const student_id = req.params.student_id;
    const counseling_id = req.params.counseling_id;
    // 로그인 된 교사의 교번
    const teacher_id = req.session.user.linked[0];

    // console.log("현재 로그인 된 교사 교번: ", teacher_id);

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

    // 상담 내역의 ID가 제공되지 않은 경우
    if (!counseling_id) {
      return res.status(400).json({ message: "상담 내역 ID를 제공해주세요." });
    }

    // 상담 내역의 ID가 유효하지 않은 경우
    if (!mongoose.Types.ObjectId.isValid(counseling_id)) {
      return res
        .status(400)
        .json({ message: "상담 내역 ID가 유효하지 않습니다." });
    }

    // 상담 내역 조회
    const theCounseling = await Counseling.findOne({
      _id: counseling_id,
      student_id: student_id,
    });

    // 상담 내역이 존재하지 않음
    if (theCounseling == null) {
      return res
        .status(404)
        .json({ message: "상담 내역이 존재하지 않습니다." });
    }

    // 수정하려는 교사(로그인 된 교사)와 상담 내역 작성자가 다를 경우 수정 불가
    if (theCounseling.teacher_id !== teacher_id) {
      return res
        .status(403)
        .json({ message: "상담 내역 수정 권한이 없습니다." });
    }

    // 수정하려는 교사와 상담 내역 작성자가 일치
    // 상담 내역 수정
    // 학기 설정
    const month = new Date().getMonth() + 1; // 월은 0부터 시작하므로 +1
    const semester = month <= 6 ? "firstSemester" : "finalSemester";

    theCounseling.topic = req.body.topic;
    theCounseling.title = req.body.title;
    theCounseling.content = req.body.content;
    theCounseling.next_date = req.body.next_date;
    theCounseling.next_content = req.body.next_content;
    theCounseling.semester = semester;

    await theCounseling.save();

    // 상담 내역 수정 성공
    res.status(200).json({
      message: "상담 내역 수정 성공",
      counseling: theCounseling,
    });
  } catch (error) {
    console.error("학생 상담 수정 오류:", error);
    res.status(500).json({ message: "학생 상담 수정 실패", error });

    Sentry.withScope((scope) => {
      scope.setLevel("error");
      scope.setTag("type", "api");
      scope.setTag("api", "modifyCounseling");
      Sentry.captureException(error);
    });
  }
});

exports.deleteCounseling = asyncHandler(async (req, res) => {
  try {
    const student_id = req.params.student_id;
    const counseling_id = req.params.counseling_id;
    const teacher_id = req.session.user.linked[0];

    if (!student_id) {
      return res.status(400).json({ message: "학생 학번을 제공해주세요." });
    }

    if (isNaN(student_id)) {
      return res
        .status(400)
        .json({ message: "학생의 학번은 숫자여야 합니다." });
    }

    if (!counseling_id) {
      return res.status(400).json({ message: "상담 내역 ID를 제공해주세요." });
    }

    if (!mongoose.Types.ObjectId.isValid(counseling_id)) {
      return res
        .status(400)
        .json({ message: "상담 내역 ID가 유효하지 않습니다." });
    }

    // 상담 내역 조회
    const theCounseling = await Counseling.findOne({
      _id: counseling_id,
      student_id: student_id,
    });

    // 상담 내역이 존재하지 않음
    if (theCounseling == null) {
      return res
        .status(404)
        .json({ message: "상담 내역이 존재하지 않습니다." });
    }

    // 수정하려는 교사(로그인 된 교사)와 상담 내역 작성자가 다를 경우 삭제 불가
    if (theCounseling.teacher_id !== teacher_id) {
      return res
        .status(403)
        .json({ message: "상담 내역 삭제 권한이 없습니다." });
    }

    // 상담 내역 삭제
    await Counseling.deleteOne({
      _id: counseling_id,
      student_id: student_id,
    });
    // 상담 내역 삭제 성공
    return res.status(200).json({
      message: "상담 내역 삭제 성공",
      counseling_id: counseling_id,
    });
  } catch (error) {
    console.error("학생 상담 삭제 오류:", error);
    res.status(500).json({ message: "학생 상담 삭제 실패", error });

    Sentry.withScope((scope) => {
      scope.setLevel("error");
      scope.setTag("type", "api");
      scope.setTag("api", "deleteCounseling");
      Sentry.captureException(error);
    });
  }
});
