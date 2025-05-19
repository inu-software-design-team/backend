const mongoose = require("mongoose");
const Feedback = require("../models/Feedback");

mongoose
  .connect(
    "mongodb+srv://kgs9843:rlarltn9843@cluster0.npsmpmi.mongodb.net/COSY"
  )
  .then(async () => {
    await Feedback.insertOne({
      student_id: 2001,
      teacher_id: 1001,
      date: new Date("2025-03-25"),
      category: "출결/태도",
      title: "지각 증가",
      content:
        "최근 2주간 3회 지각이 발생하였습니다. 등교 시간을 준수할 수 있도록 가정에서도 지도 부탁드립니다.",
      semester: "firstSemester",
    });

    await Feedback.insertOne({
      student_id: 2001,
      teacher_id: 1001,
      date: new Date("2025-04-31"),
      category: "성적",
      title: "중간고사 성적 향상",
      content:
        "이번 중간고사에서 국어 점수가 이전 시험보다 10점 상승했습니다. 꾸준한 학습 노력이 결실을 맺은 것으로 보입니다.",
      semester: "firstSemester",
    });
  });
