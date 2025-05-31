const express = require("express");
const {
  checkGrade,
  selectYearForGrade,
} = require("../controllers/parentGradeController");

const { checkMyKids } = require("../controllers/studentListController");
const router = express.Router();

const {
  checkAllCounseling,
} = require("../controllers/parentCounselingController");

const { checkAllFeedback } = require("../controllers/parentFeedbackController");

router.route("/grades").get(checkMyKids);
//성적
router.route("/grades/yearList/:student_id").get(selectYearForGrade);
router.route("/grades/:student_id/:year").get(checkGrade);

// 상담
// 선택한 학생의 상담 내역 조회
router.route("/counselings/:student_id").get(checkAllCounseling);

//피드백
router.route("/feedback/:student_id").get(checkAllFeedback);

module.exports = router;
