const mongoose = require("mongoose");

// Mongoose 스키마 및 모델 설정
const studentRecordSchema = new mongoose.Schema({
  // 학급
  class_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  },
  // 학생
  student_id: {
    type: Number,
    required: true,
  },
  // 출결
  attendance_id: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attendance",
      required: true,
    },
  ],
  // 특이사항
  remarks_id: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Remark",
    },
  ],
});

studentRecordSchema.virtual("Class", {
  ref: "Class",
  localField: "class_id",
  foreignField: "_id",
  justOne: true,
});

studentRecordSchema.virtual("student", {
  ref: "Student",
  localField: "student_id", // 현재 스키마에서 참조하는 필드
  foreignField: "student_id", // Teacher 테이블의 필드 (기본 _id가 아님!)
  justOne: true, // 한 명의 학생만 참조
});

studentRecordSchema.set("toObject", { virtuals: true });
studentRecordSchema.set("toJSON", { virtuals: true });

module.exports =
  mongoose.models.StudentRecord ||
  mongoose.model("StudentRecord", studentRecordSchema);
