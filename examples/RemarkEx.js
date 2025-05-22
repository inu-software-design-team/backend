const mongoose = require("mongoose");
const Remark = require("../models/Remark");

mongoose
  .connect(
    "mongodb+srv://kgs9843:rlarltn9843@cluster0.npsmpmi.mongodb.net/COSY"
  )
  .then(async () => {
    const dummyRemarks = [
      {
        subject: "국어",
        title: "우수한 발표",
        content: "수업 시간에 발표를 잘 하였습니다.",
        date: new Date("2025-04-01"),
        teacher_id: 1001,
      },
      {
        subject: "수학",
        title: "문제 풀이 능력 향상",
        content: "최근 수학 문제 풀이 능력이 향상되었습니다.",
        date: new Date("2025-04-10"),
        teacher_id: 1001,
      },
      {
        subject: "영어",
        title: "영어 회화 능력 향상",
        content: "영어 회화 능력이 많이 향상되었습니다.",
        date: new Date("2025-03-25"),
        teacher_id: 1001,
      },
      {
        subject: "과학",
        title: "실험 보고서 우수",
        content:
          "실험 보고서 작성이 매우 우수하였습니다. 실험 결과를 잘 정리하였습니다.",
        date: new Date("2024-12-15"),
        teacher_id: 1001,
      },
      {
        subject: "사회",
        title: "우수한 발표",
        content: "사회 과목 발표를 잘 하였습니다.",
        date: new Date("2025-01-20"),
        teacher_id: 1001,
      },
    ];

    await Remark.insertMany(dummyRemarks);
    console.log("✅ Remark 더미 데이터 삽입 완료");
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("❌ MongoDB 연결 오류:", err);
  });
