const mongoose = require("mongoose");

// total_score, avrage 그리고 각 모든 과목들의 성적들은 중간/기말을 구분하기 위해 배열로 저장되어 있음
const ScoreSchema = new mongoose.Schema({
  class_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  }, // 학급
  student_id: { type: Number, ref: "Student", required: true }, // 학번
  teacher_id: { type: Number, ref: "Teacher", required: true }, // 교번
  korean: { type: mongoose.Schema.Types.Mixed }, // 국어
  math: { type: mongoose.Schema.Types.Mixed }, // 수학
  english: { type: mongoose.Schema.Types.Mixed }, // 영어
  society: { type: mongoose.Schema.Types.Mixed }, // 사회
  science: { type: mongoose.Schema.Types.Mixed }, // 과학
  total_score: { type: mongoose.Schema.Types.Mixed }, // 총점
  average: { type: mongoose.Schema.Types.Mixed }, // 평균
  year: { type: Number, required: true }, // 연도
});

ScoreSchema.virtual("class", {
  ref: "Class",
  localField: "class_id",
  foreignField: "_id",
  justOne: true,
});

ScoreSchema.virtual("teacher", {
  ref: "Teacher",
  localField: "teacher_id",
  foreignField: "teacher_id",
  justOne: true,
});

ScoreSchema.virtual("student", {
  ref: "Student",
  localField: "student_id",
  foreignField: "student_id",
  justOne: true,
});

module.exports = mongoose.model.Score || mongoose.model("Score", ScoreSchema);
