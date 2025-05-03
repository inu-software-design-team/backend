const mongoose = require("mongoose");
const semester = require("./semester");

// Mongoose 스키마 및 모델 설정 예제

const classSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true }, // 기본키 (PK)
  grade: { type: Number, required: true }, // 학년
  class: { type: Number, required: true }, // 반

  teacher_id: {
    type: Number,
    required: true,
  },
  semester_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Semester", // 학기 테이블(Semester) 참조 (FK)
  },
});

// teacher_id가 Teacher 테이블의 teacher_id 필드와 연결되도록 가상 필드 설정
classSchema.virtual("teacher", {
  ref: "Teacher",
  localField: "teacher_id", // 현재 스키마에서 참조하는 필드
  foreignField: "teacher_id", // Teacher 테이블의 필드 (기본 _id가 아님!)
  justOne: true, // 한 명의 교사만 참조
});

module.exports = mongoose.models.Class || mongoose.model("Class", classSchema);
