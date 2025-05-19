const mongoose = require("mongoose");
const Counseling = require("../models/Counseling");

mongoose
  .connect(
    "mongodb+srv://kgs9843:rlarltn9843@cluster0.npsmpmi.mongodb.net/COSY"
  )
  .then(async () => {
    await Counseling.insertOne({
      class_id: new mongoose.Types.ObjectId("68176e5d84223682274493b7"),
      student_id: 2001,
      teacher_id: 1001,
      date: new Date("2025-03-25"),
      topic: "학업",
      title: "수학 과목 성적 하락",
      content:
        "최근 수학에 대한 흥미가 떨어졌다고 함. 기초 개념부터 다시 학습할 필요가 있음. 특히 함수와 방정식 부분에서 어려움을 겪고 있어 이 부분에 대한 보충 학습이 필요함.",
      next_date: new Date("2025-04-01"),
      next_content: "수학 기초 개념 학습 진행 상황 및 추가 학습 방향 설정",
    });

    await Counseling.insertOne({
      class_id: new mongoose.Types.ObjectId("68176e5d84223682274493b7"),
      student_id: 2001,
      teacher_id: 1001,
      date: new Date("2025-04-02"),
      topic: "개인",
      title: "스트레스 관리",
      content:
        "학업과 교내 활동 병행으로 인한 스트레스 호소. 시간 관리 방법과 스트레스 해소 방안에 대해 조언. 규칙적인 운동과 취미 활동을 권장함",
      next_date: new Date("2025-04-30"),
      next_content: "스트레스 관리 방법 실천 여부 확인 및 추가 지원 방안 모색",
    });

    await Counseling.insertOne({
      class_id: new mongoose.Types.ObjectId("68176e5d84223682274493b7"),
      student_id: 2001,
      teacher_id: 1001,
      date: new Date("2025-03-28"),
      topic: "행동",
      title: "교우 관계 계선",
      content:
        "최근 수학에 대한 흥미가 떨어졌다고 함. 기초 개념부터 다시 학습할 필요가 있음. 특히 함수와 방정식 부분에서 어려움을 겪고 있어 이 부분에 대한 보충 학습이 필요함.",
      next_date: new Date("2025-04-01"),
      next_content: "수학 기초 개념 학습 진행 상황 및 추가 학습 방향 설정",
    });
  });
