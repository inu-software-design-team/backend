const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  identifier: { type: String, required: true }, // 아이디(이메일)
  kakaoId: { type: Number }, // 카카오식별번호
  password: { type: String, required: true }, // 비밀번호
  linked: { type: [Number], required: true }, // 부여된 고유번호
  role: { type: String, required: true }, // 역할
});

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
