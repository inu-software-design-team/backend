const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
  student_id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  gender: { type: String, required: true },
  
});

module.exports =
  mongoose.models.Student || mongoose.model("Student", StudentSchema);
