const mongoose = require("mongoose");

// Mongoose 스키마 및 모델 설정 예제
const semesterSchema = new mongoose.Schema({
  year: { type: Number, required }, // 몇 년도
  session: { type: Number, required: true },
});

module.exports =
  mongoose.models.Semester || mongoose.model("Semester", semesterSchema);
