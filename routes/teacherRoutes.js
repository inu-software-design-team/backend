const express = require("express");
const { checkAll, checkGrade } = require("../controllers/teacherController");

const router = express.Router();

// 성적

// 학생 성적 확인
// 선택한 연도의 해당 교사의 모든 학생 조회
router.route("/grades").get(checkAll);
// 선택한 학생의 성적 조회/선택한 학생의 성적 추가/선택한 학생의 성적 수정/선택한 학생의 성적 삭제
router.route("/grades/:student_id").get(checkGrade);
module.exports = router;
