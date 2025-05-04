const mongoose = require("mongoose");

// Mongoose 스키마 및 모델 설정 예제
const teacherSchema = new mongoose.Schema({
  teacher_id: { type: Number, required: true, unique: true }, // 교번
  name: { type: String, required: true }, // 이름
  gender: { type: String, required: true }, // 성별
  subject: { type: String, required: true }, // 담당과목
});

module.exports =
  mongoose.models.Teacher || mongoose.model("Teacher", teacherSchema);
