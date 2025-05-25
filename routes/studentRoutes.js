const express = require("express");
const {
  checkAll,
  selectYearForGrade,
  checkGrade,
} = require("../controllers/studentGradeController");

const {
  checkAllCounseling,
} = require("../controllers/studentCounselingController");

const {
  checkAllFeedback,
} = require("../controllers/studentFeedbackController");

const {
  gradeReport,
  counselingReport,
  feedbackReport,
  attendanceReport,
} = require("../controllers/studentReportController");

const router = express.Router();

router.route("/grades").get(checkAll);
//성적
router.route("/grades/yearList/:student_id").get(selectYearForGrade);
router.route("/grades/:student_id/:year").get(checkGrade);

// 상담
// 선택한 학생의 상담 내역 조회
router.route("/counselings/:student_id").get(checkAllCounseling);

//피드백
router.route("/feedback/:student_id").get(checkAllFeedback);

//보고서
//성적
router.route("/gradeReport/:student_id").get(gradeReport);
//상담
router.route("/counselingReport/:student_id").get(counselingReport);
//피드백
router.route("/feedbackReport/:student_id").get(feedbackReport);
//학생부
router.route("/attendanceReport/:student_id").get(attendanceReport);

module.exports = router;
