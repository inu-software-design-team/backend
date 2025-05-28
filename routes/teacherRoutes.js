const express = require("express");

const {
  checkAll,
  selectYear,
} = require("../controllers/studentListController");
const {
  selectYearForGrade,
  checkGrade,
  modifyGrade,
  deleteGrade,
  createGrade,
} = require("../controllers/teacherGradeController");
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

const {
  checkAllCounseling,
  createCounseling,
  modifyCounseling,
  deleteCounseling,
} = require("../controllers/teacherCounselingController");

const {
  checkAllFeedback,
  modifyFeedback,
  deleteFeedback,
  createFeedback,
} = require("../controllers/teacherFeedbackController");

const router = express.Router();

// 학생 목록
// 학생 목록 탭 연도 선택지 제공
router.route("/studentslist").get(selectYear);
// 선택한 연도의 해당 교사의 모든 학생 조회
router.route("/studentslist/:year").get(checkAll);

// 성적

// 학생 성적 확인
// 체이닝 방식 클라이언트 요청에 맞게 여러개 체이닝 가능!
// 학생 성적 확인 연도 선택지 제공
router.route("/grades/:student_id").get(selectYearForGrade);
// 선택한 학생의 성적 조회/선택한 학생의 성적 추가/선택한 학생의 성적 수정/선택한 학생의 성적 삭제
router.route("/grades/:student_id/:year").get(checkGrade);
router.route("/grades/:student_id").put(modifyGrade);
router.route("/grades/:student_id").delete(deleteGrade); // DELETE HTTP METHOD 동작 안함

/* 학생부 */
router
  .route("/grades/:student_id/:year/:subject/:semester/:term")
  .delete(deleteGrade);
router.route("/grades/:student_id").post(createGrade);

// 학생부
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

// 상담
// 선택한 학생의 상담 내역 조회/새로운 상담 내역 생성/상담 내역 수정(작성자와 수정자의 교번이 일치할 때만 가능)/상담 내역 삭제(작성자와 삭제자의 교번이 일치할 때만 가능)
router.route("/counselings/:student_id").get(checkAllCounseling);
router.route("/counselings/:student_id").post(createCounseling);
router.route("/counselings/:student_id/:counseling_id").patch(modifyCounseling);
router
  .route("/counselings/:student_id/:counseling_id")
  .delete(deleteCounseling);

// 피드백
// 선택한 학생의 피드백 내역 조회/새로운 피드백 내역 생성/피드백 내역 수정(작성자와 수정자의 교번이 일치할 때만 가능)/피드백 내역 삭제(작성자와 삭제자의 교번이 일치할 때만 가능)
router.route("/feedback/:student_id").get(checkAllFeedback);
router.route("/feedback/:student_id/:feedback_id").patch(modifyFeedback);
router.route("/feedback/:student_id/:feedback_id").delete(deleteFeedback);
router.route("/feedback/:student_id").post(createFeedback);

module.exports = router;
