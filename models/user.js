const mongoose = require("mongoose");
const Counter = require("./Counter"); // 카운터 모델을 import

// Mongoose 스키마 및 모델 설정 예제
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  nickname: { type: String, required: true },
  password: String,
  admin: { type: Number, default: 0 },
  index: { type: Number, unique: true }, // 자동 증가 인덱스 필드
  profileImageUrl: { type: String },
});

// 사용자 생성 전에 인덱스 필드 설정
UserSchema.pre("save", async function (next) {
  if (this.isNew) {
    // 새 문서인 경우에만 인덱스 설정
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: "user_index" }, // 카운터의 _id 값
        { $inc: { sequence_value: 1 } }, // sequence_value를 1 증가
        { new: true, upsert: true } // 문서가 없으면 새로 생성
      );

      this.index = counter.sequence_value; // 증가된 값 설정
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
