require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const connectDB = require("./config/db");

const app = express();
const port = process.env.PORT || 3000;
const publicPath = path.resolve(__dirname, "public");

//db연결
connectDB();

// 미들웨어
app.use("/", express.static(publicPath));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
  })
);
app.use(cookieParser());

// 라우트
app.use("/api/v1/users", require("./routes/userRoutes"));

<<<<<<< HEAD
//db
const User = require("./models/user");

// 유저 생성 함수
const createUser = async () => {
  try {
    const newUser = new User({
      id: 1,
      identifier: "유저1234",
      password: "password123",
      linked: { something: "wtf" },
      role: "학생",
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
=======
>>>>>>> 2a0acfce5195739f04eef034798fdfdcb5587a85
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// //db
// const User = require("./models/User");

// // 실행
// //seedDB().catch((err) => console.error(err));
// // // 유저 생성 함수
// // const createUser = async () => {
// //   try {
// //     const newUser = new User({
// //       email: "user@example.com",
// //       nickname: "유저123",
// //       password: "password123",
// //       admin: 0,
// //       profileImageUrl: "https://example.com/profile.png",
// //     });

// //     const savedUser = await newUser.save();
// //     console.log("✅ 유저 생성 완료:", savedUser);
// //   } catch (err) {
// //     console.error("❌ 유저 생성 실패:", err);
// //   } finally {
// //     mongoose.connection.close();
// //   }
// // };

// // // 함수 실행
// // createUser();
