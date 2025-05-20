const mongoose = require("mongoose");
// Mongoose 스키마 및 모델 설정
const FeedbackSchema = new mongoose.Schema({
  // 학번
  student_id: {
    type: Number,
    required: true,
  },
  // 작성자
  teacher_id: {
    type: Number,
    required: true,
  },
  // 학급
  class_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  },
  date: { type: Date, required: true }, // JSON 타입을 Mixed로 지정. 피드백 날짜
  category: { type: String, required: true }, // 주제
  title: { type: String, required: true }, // 제목
  content: { type: String, required: true }, // 내용
  semester: { type: String, required: true }, // 학기
});

FeedbackSchema.virtual("student", {
  ref: "Student",
  localField: "student_id", // 현재 스키마에서 참조하는 필드
  foreignField: "student_id", // Teacher 테이블의 필드 (기본 _id가 아님!)
  justOne: true, // 한 명의 학생만 참조
});

// teacher_id가 Teacher 테이블의 teacher_id 필드와 연결되도록 가상 필드 설정
FeedbackSchema.virtual("teacher", {
  ref: "Teacher",
  localField: "teacher_id", // 현재 스키마에서 참조하는 필드
  foreignField: "teacher_id", // Teacher 테이블의 필드 (기본 _id가 아님!)
  justOne: true, // 한 명의 교사만 참조
});

FeedbackSchema.virtual("class", {
  ref: "Class",
  localField: "class_id",
  foreignField: "_id",
  justOne: true,
});

FeedbackSchema.set("toObject", { virtuals: true });
FeedbackSchema.set("toJSON", { virtuals: true });

module.exports =
  mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema);
