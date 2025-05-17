const mongoose = require("mongoose");

const RemarkSchema = new mongoose.Schema({
  topic: { type: String, required: true }, // 주제
  title: { type: String, required: true }, // 제목
  content: { type: String, required: true }, // 내용
  date: { type: mongoose.Schema.Mixed, required: true }, // 날짜
  teacher_id: { type: Number, required: true }, // 작성자
});

RemarkSchema.virtual("teacher", {
  ref: "Teacher",
  localField: "teacher_id",
  foreignField: "teacher_id",
  justOne: true,
});

RemarkSchema.set("toObject", { virtuals: true });
RemarkSchema.set("toJSON", { virtuals: true });

module.exports =
  mongoose.model.Remark || mongoose.model("Remark", RemarkSchema);
