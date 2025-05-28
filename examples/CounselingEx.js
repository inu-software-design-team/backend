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
      semester: "firstSemester",
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
      semester: "firstSemester",
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
      semester: "firstSemester",
    });

    await Counseling.insertOne({
      class_id: new mongoose.Types.ObjectId("68184d8ad7b8ac4e399e3935"),
      student_id: 2001,
      teacher_id: 1001,
      date: new Date("2024-08-28"),
      topic: "가정",
      title: "부모님과의 갈등",
      content:
        "최근 학생이 부모님과의 의견 충돌이 잦아졌다고 호소함. 주로 진로 선택과 관련된 문제로, 서로의 기대치 차이에서 갈등이 발생하고 있음. 학생은 자신의 의견을 존중받고 싶어하는 경향이 강함.",
      next_date: new Date("2024-09-10"),
      next_content:
        "진로 상담 및 부모님과의 소통 방법 지도. 다음 상담 시 학생의 감정 변화 및 대화 진행 상황 확인 예정.",
      semester: "lastSemester",
    });
  });
