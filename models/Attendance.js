const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
  date: { type: mongoose.Schema.Types.Mixed, required: true }, // 날짜
  state: { type: String, required: true }, // 상태
  reason: { type: String, required: true }, // 사유
  file: { type: mongoose.Schema.Types.Mixed }, // 첨부파일
});

module.exports =
  mongoose.model.Attendance || mongoose.model("Attendance", AttendanceSchema);
