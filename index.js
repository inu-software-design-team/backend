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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
