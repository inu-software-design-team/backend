const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");

mongoose
  .connect(
    "mongodb+srv://kgs9843:rlarltn9843@cluster0.npsmpmi.mongodb.net/COSY"
  )
  .then(async () => {
    const dummyData = [
      // 2025년 1학기 (3월 ~ 6월)
      {
        date: new Date("2025-03-10"),
        state: "지각",
        reason: "버스 지연",
        file: null,
      },
      {
        date: new Date("2025-04-01"),
        state: "결석",
        reason: "고열로 병원 진료",
        file: null,
      },
      {
        date: new Date("2025-05-15"),
        state: "조퇴",
        reason: "치과 예약",
        file: null,
      },
      {
        date: new Date("2025-06-03"),
        state: "결석",
        reason: "가족 행사 참석",
        file: null,
      },
      {
        date: new Date("2025-06-21"),
        state: "지각",
        reason: "늦잠",
        file: null,
      },

      // 2024년 2학기 (9월 ~ 12월)
      {
        date: new Date("2024-09-05"),
        state: "결석",
        reason: "감기 증상",
        file: null,
      },
      {
        date: new Date("2024-10-11"),
        state: "조퇴",
        reason: "눈병 증세",
        file: null,
      },
      {
        date: new Date("2024-11-03"),
        state: "지각",
        reason: "지하철 문제",
        file: null,
      },
      {
        date: new Date("2024-11-27"),
        state: "결석",
        reason: "병원 정기검진",
        file: null,
      },
      {
        date: new Date("2024-12-15"),
        state: "조퇴",
        reason: "두통으로 조기 귀가",
        file: null,
      },
    ];

    await Attendance.insertMany(dummyData);
    console.log("📌 Attendance 더미 데이터 삽입 완료");
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("❌ MongoDB 연결 오류:", err);
  });
