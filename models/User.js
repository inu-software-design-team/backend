const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  kakaoId: { type: Number }, // 카카오식별번호
  linked: { type: [Number], required: true }, // 부여된 고유번호
  role: { type: String, required: true }, // 역할
  email: { type: String, required: true }, // 아이디
  phone: { type: String, required: true }, // 전화번호
  address: { type: String, required: true }, // 주소
});

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
