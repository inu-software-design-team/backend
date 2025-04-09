const mongoose = require("mongoose");

// Mongoose 스키마 및 모델 설정 예제
const teacherSchema = new mongoose.Schema({
  teacher_id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  gender: { type: String, required: true },
  subject: { type: String, required: true },
});

module.exports =
  mongoose.models.Teacher || mongoose.model("Teacher", teacherSchema);
