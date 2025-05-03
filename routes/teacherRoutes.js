const express = require("express");
const { checkAll, checkGrade } = require("../controllers/teacherController");

const router = express.Router();

// 성적

// 학생 성적 확인
// 해당 교사의 모든 학생 조회
router.get("/grades", checkAll);
