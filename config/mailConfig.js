const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});
transporter.verify((error, success) => {
  if (error) {
    console.log("SMTP 서버 오류: ", error);
  } else {
    console.log("SMTP 서버가 메시지 받을 준비 완료");
  }
});

module.exports = transporter;
