const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  student_id: { type: Number, required: true, unique: true }, // 학번
  name: { type: String, required: true }, // 이름
  gender: { type: String, required: true }, // 성별
  registration_number: { type: String, required: true }, // 주민등록번호
  address: { type: String }, // 주소
  phone: { type: String }, // 연락처처
  class_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: false,
  }, // 학급
  // 학급 이력
  class_history: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
  ],
});

StudentSchema.virtual("class", {
  ref: "Class",
  localField: "class_id", // 현재 스키마에서 참조하는 필드
  foreignField: "_id", // Class 테이블의 필드 (기본 _id가 아님!)
  justOne: true, // 하나의 학급만 참조
});

module.exports =
  mongoose.models.Student || mongoose.model("Student", StudentSchema);
