const express = require("express");
const {
  checkAll,
  checkGrade,
} = require("../controllers/parentGradeController");
const router = express.Router();

const {
  checkAllCounseling,
} = require("../controllers/parentCounselingController");

router.route("/grades/:year").get(checkAll);
router.route("/grades/:student_id/:year").get(checkGrade);

// 상담
// 선택한 학생의 상담 내역 조회
router.route("/counselings/:student_id").get(checkAllCounseling);

module.exports = router;
