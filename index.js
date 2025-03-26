require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoURI = process.env.MONGODB_URL;
//const stdRouter = require("./routes/stdRoute");
const path = require("path");

const publicPath = path.resolve(__dirname, "public");

app.use("/", express.static(publicPath));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
  })
);
app.use(cookieParser());

mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

//db
const User = require("./models/user");

// 유저 생성 함수
const createUser = async () => {
  try {
    const newUser = new User({
      email: "user@example.com",
      nickname: "유저123",
      password: "password123",
      admin: 0,
      profileImageUrl: "https://example.com/profile.png",
    });

    const savedUser = await newUser.save();
    console.log("✅ 유저 생성 완료:", savedUser);
  } catch (err) {
    console.error("❌ 유저 생성 실패:", err);
  } finally {
    mongoose.connection.close();
  }
};

// 함수 실행
createUser();

//app.use("/students", stdRouter);
app.listen(port, () => {
  console.log("Server is running on port 3000");
});
