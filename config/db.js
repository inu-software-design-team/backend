const mongoose = require("mongoose");
const Sentry = require("@sentry/node");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("MongoDB Connected!");
  } catch (error) {
    console.error("DB Connection Failed!", error);
    Sentry.withScope((scope) => {
      scope.setLevel("error");
      scope.setTag("type", "database");
      scope.setTag("database", "mongo");
      Sentry.captureException(error);
    });
  }
};

module.exports = connectDB;
