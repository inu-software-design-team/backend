const express = require("express");
const {
  checkAll,
  checkGrade,
  modifyGrade,
} = require("../controllers/teacherController");
const {
  fetchInformation,
  modifyInformation,
  modifyName,
  fetchAttendance,
  deleteAttendance,
  addAttendance,
  patchAttendance,
  fetchRemark,
  addRemark,
  patchRemark,
  deleteRemark,
} = require("../controllers/teacherStudentRecordController");

const router = express.Router();

// 성적

// 학생 성적 확인
// 선택한 연도의 해당 교사의 모든 학생 조회
// 체이닝 방식 클라이언트 요청에 맞게 여러개 체이닝 가능!
router.route("/grades").get(checkAll);
// 선택한 학생의 성적 조회/선택한 학생의 성적 추가/선택한 학생의 성적 수정/선택한 학생의 성적 삭제
router.route("/grades/:student_id").get(checkGrade);
router.route("/grades/:student_id").put(modifyGrade);

/* 학생부 */
// 인적사항
router
  .route("/user_information/:student_id")
  .get(fetchInformation)
  .patch(modifyInformation);

//이름 수정
router.route("/user_information/modify_name/:student_id").patch(modifyName);

// 출석부
router
  .route("/user_attendance/:student_id")
  .get(fetchAttendance)
  .delete(deleteAttendance)
  .post(addAttendance)
  .patch(patchAttendance);

router
  .route("/user_remark/:student_id")
  .get(fetchRemark)
  .post(addRemark)
  .patch(patchRemark)
  .delete(deleteRemark);

module.exports = router;
