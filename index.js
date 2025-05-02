const Sentry = require("@sentry/node");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");

Sentry.init({
  dsn: process.env.DSN,
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: 0.2,
  profileSessionSampleRate: 0.2,
  profileLifecycle: "trace",
  // integrations: [nodeProfilingIntegration()],
  // // tracesSampleRate: 0.1, // 전체 트랜잭션의 10%만 수집
  // tracesSampler: (samplingContext) => {
  //   const duration = samplingContext.transaction?.duration;
  //   if (duration && duration > 0.5) {
  //     return 1.0; // 느린 트랜잭션은 100% 샘플링
  //   }
  //   return 0.1; // 그 외에는 10%
  // },
  // profileSessionSampleRate: 0.2, // 수집된 트랜잭션 중 10%만 프로파일링
  // profileLifecycle: "trace",
});

const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const connectDB = require("./config/db");
const session = require("express-session");
const MongoStore = require("connect-mongo");

dotenv.config({
  path: path.resolve(
    __dirname,
    `.env.${process.env.NODE_ENV || "development"}`
  ),
});
const app = express();
const port = process.env.BACKPORT || 4000;
const publicPath = path.resolve(__dirname, "public");

//스웨거 부분
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger/swagger");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//db연결
connectDB();

const allowedOrigins = [
  process.env.FRONTEND_ORIGIN, // 실제 프론트
  "http://localhost:3000", // 혹시 다른 형태로 들어올 경우
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

Sentry.setupExpressErrorHandler(app);

// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
  res.status(500).json({
    message: "서버에 문제가 발생했어요. 문의해주세요.",
    errorId: res.sentry, // Sentry에서 기록된 에러 ID
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
