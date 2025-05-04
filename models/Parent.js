const mongoose = require("mongoose");

const ParentSchema = new mongoose.Schema({
  child_id: { type: [Number], required: true }, // 자녀학번
  name: { type: String, required: true }, // 이름
  gender: { type: String, required: true }, // 성별
  phone: { type: String }, // 연락처
  occupation: { type: String }, // 직업
});

module.exports =
  mongoose.models.Parent || mongoose.model("Parent", ParentSchema);
