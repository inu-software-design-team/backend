const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  student_id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  gender: { type: String, required: true },
  class_id: { type: mongoose.Schema.Types.ObjectId, required: false },
});

StudentSchema.virtual("class", {
  ref: "Class",
  localField: "class_id", // 현재 스키마에서 참조하는 필드
  foreignField: "id", // Class 테이블의 필드 (기본 _id가 아님!)
  justOne: true, // 하나의 학급만 참조
});

module.exports =
  mongoose.models.Student || mongoose.model("Student", StudentSchema);
