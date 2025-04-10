require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const connectDB = require("./config/db");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const app = express();
const port = process.env.PORT || 3000;
const publicPath = path.resolve(__dirname, "public");

//스웨거 부분
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger/swagger");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//db연결
connectDB();

const allowedOrigins = [
  process.env.FRONTEND_ORIGIN, // 실제 프론트
  "http://127.0.0.1:3000", // 혹시 다른 형태로 들어올 경우
  "http://localhost", // Thunder Client나 Postman용
  undefined, // origin 없는 요청 허용 (ThunderClient 같은 툴에서 필요함)
];

// 미들웨어
app.use("/", express.static(publicPath));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS 차단: 허용되지 않은 origin"));
      }
    },
    credentials: true, // 쿠키 허용!
  })
);
app.use(cookieParser());

//세션이 어떻게 작동할지", 그리고 "세션 쿠키가 어떻게 생길지"를 정의
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URL }),
    cookie: {
      httpOnly: true,
      secure: false, // 배포 환경에서는 true (https만 될지)
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
    },
  })
);

// 라우트
app.use("/api/v1/users", require("./routes/userRoutes"));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
