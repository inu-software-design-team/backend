const mongoose = require("mongoose");
const Remark = require("../models/Remark");

mongoose
  .connect(
    "mongodb+srv://kgs9843:rlarltn9843@cluster0.npsmpmi.mongodb.net/COSY"
  )
  .then(async () => {
    const dummyRemarks = [
      {
        topic: "학습 태도",
        title: "수업 집중도 향상 필요",
        content: "최근 수업 중 집중력이 다소 떨어져 주의가 필요합니다.",
        date: new Date("2025-04-01"),
        teacher_id: 1001,
      },
      {
        topic: "교우 관계",
        title: "우수한 협동심",
        content: "팀 프로젝트에서 친구들과 협력하는 모습이 인상적이었습니다.",
        date: new Date("2025-04-10"),
        teacher_id: 1001,
      },
      {
        topic: "생활 태도",
        title: "지각 잦음",
        content: "최근 일주일 간 3회 지각이 있어 지도 예정입니다.",
        date: new Date("2025-03-25"),
        teacher_id: 1001,
      },
      {
        topic: "학업 성취",
        title: "수학 성적 향상",
        content:
          "최근 수학 퀴즈에서 좋은 점수를 받았습니다. 노력이 돋보입니다.",
        date: new Date("2024-12-15"),
        teacher_id: 1001,
      },
      {
        topic: "기타",
        title: "책임감 있는 행동",
        content: "학급 임원으로서 행사 준비를 성실히 수행하였습니다.",
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
