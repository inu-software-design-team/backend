const mongoose = require(mongoose);

const ScoreSchema = new mongoose.Schema({
  id: { type: String, required: true },
  total_score: { type: Number, required: true },
  average: { type: Number, required: true },
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  semester_id: { type: mongoose.Schema.Types.ObjectId, ref: "Semester" },
  teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
  korean: { type: mongoose.Schema.Types.Mixed, required: true },
  math: { type: mongoose.Schema.Types.Mixed, required: true },
  society: { type: mongoose.Schema.Types.Mixed, required: true },
  science: { type: mongoose.Schema.Types.Mixed, required: true },
});

module.exports = mongoose.model("Score", ScoreSchema);
