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

module.exports = router;
