const ejs = require("ejs");
const puppeteer = require("puppeteer");
const path = require("path");
const asyncHandler = require("express-async-handler");
const Student = require("../models/Student");
const Score = require("../models/Score");
const Counseling = require("../models/Counseling");
const Feedback = require("../models/Feedback");
const StudentRecord = require("../models/StudentRecord");
const Attendance = require("../models/Attendance");

//성적보고서
exports.gradeReport = asyncHandler(async (req, res) => {
  const student_id = req.params.student_id;
  try {
    const student = await Student.findOne({
      student_id: student_id,
    }).populate("class_id");

    // 해당 학생의 모든 성적 컬렉션 조회 후 연도 목록 추출
    const studentGrade = await Score.find({
      student_id: student_id,
    });

    // year 기준 오름차순 정렬
    studentGrade.sort((a, b) => a.year - b.year);

    console.log(studentGrade);

    // 해당 학생이 존재하지 않을 경우
    if (!student) return res.status(404).send("학생을 찾을 수 없습니다.");
    // 학생의 성적이 존재하지 않음
    if (!studentGrade || studentGrade.length === 0)
      return res.status(404).send("성적을 찾을 수 없습니다.");

    // EJS 템플릿 경로
    const templatePath = path.join(__dirname, "../views/gradeReport.ejs");

    // HTML 렌더링
    const html = await ejs.renderFile(templatePath, { student, studentGrade });

    // Puppeteer 실행 (PDF 생성)
    const browser = await puppeteer.launch({
      headless: "new", // 안정성을 위해 'new' 모드 권장
      args: ["--no-sandbox", "--disable-setuid-sandbox"], // 서버 환경 대응
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    const filename = `성적보고서(${student.name}_${student.student_id}).pdf`;
    const encodedFilename = encodeURIComponent(filename); // UTF-8 인코딩
    // PDF 전송 헤더
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="gradeReport-${student.student_id}.pdf"; filename*=UTF-8''${encodedFilename}`
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    // 클라이언트에 전송 (Postman, 브라우저 모두 대응)
    res.end(pdfBuffer);
  } catch (error) {
    console.error("PDF 생성 에러:", error);
    res.status(500).send("서버 오류");
  }
});

//상담 보고서
exports.counselingReport = asyncHandler(async (req, res) => {
  const student_id = req.params.student_id;
  try {
    const student = await Student.findOne({
      student_id: student_id,
    }).populate("class_id");

    // 해당 학생이 존재하지 않을 경우
    if (!student) return res.status(404).send("학생을 찾을 수 없습니다.");

    const studentCounseling = await Counseling.find({
      student_id: student_id,
    });

    // 학생의 상담 기록이 존재하지 않음
    if (!studentCounseling || studentCounseling.length === 0)
      return res.status(404).send("상담 기록을 찾을 수 없습니다.");

    // date 기준 오름차순 정렬
    studentCounseling.sort((a, b) => new Date(a.date) - new Date(b.date));

    console.log(studentCounseling);

    if (!student) return res.status(404).send("학생을 찾을 수 없습니다.");
    if (!studentCounseling)
      return res.status(404).send("상담을 찾을 수 없습니다.");

    // EJS 템플릿 경로
    const templatePath = path.join(__dirname, "../views/counselingReport.ejs");

    // HTML 렌더링
    const html = await ejs.renderFile(templatePath, {
      student,
      studentCounseling,
    });

    // Puppeteer 실행 (PDF 생성)
    const browser = await puppeteer.launch({
      headless: "new", // 안정성을 위해 'new' 모드 권장
      args: ["--no-sandbox", "--disable-setuid-sandbox"], // 서버 환경 대응
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    const filename = `상담보고서(${student.name}_${student.student_id}).pdf`;
    const encodedFilename = encodeURIComponent(filename); // UTF-8 인코딩
    // PDF 전송 헤더
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="counselingReport-${student.student_id}.pdf"; filename*=UTF-8''${encodedFilename}`
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    // 클라이언트에 전송 (Postman, 브라우저 모두 대응)
    res.end(pdfBuffer);
  } catch (error) {
    console.error("PDF 생성 에러:", error);
    res.status(500).send("서버 오류");
  }
});

//피드백 보고서
exports.feedbackReport = asyncHandler(async (req, res) => {
  const student_id = req.params.student_id;
  try {
    const student = await Student.findOne({
      student_id: student_id,
    }).populate("class_id");

    const studentFeedback = await Feedback.find({
      student_id: student_id,
    });

    // date 기준 오름차순 정렬
    studentFeedback.sort((a, b) => new Date(a.date) - new Date(b.date));

    console.log(studentFeedback);

    if (!student) return res.status(404).send("학생을 찾을 수 없습니다.");
    if (!studentFeedback)
      return res.status(404).send("피드백을 찾을 수 없습니다.");

    // EJS 템플릿 경로
    const templatePath = path.join(__dirname, "../views/feedbackReport.ejs");

    // HTML 렌더링
    const html = await ejs.renderFile(templatePath, {
      student,
      studentFeedback,
    });

    // Puppeteer 실행 (PDF 생성)
    const browser = await puppeteer.launch({
      headless: "new", // 안정성을 위해 'new' 모드 권장
      args: ["--no-sandbox", "--disable-setuid-sandbox"], // 서버 환경 대응
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    const filename = `피드백보고서(${student.name}_${student.student_id}).pdf`;
    const encodedFilename = encodeURIComponent(filename); // UTF-8 인코딩
    // PDF 전송 헤더
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="feedbackReport-${student.student_id}.pdf"; filename*=UTF-8''${encodedFilename}`
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    // 클라이언트에 전송 (Postman, 브라우저 모두 대응)
    res.end(pdfBuffer);
  } catch (error) {
    console.error("PDF 생성 에러:", error);
    res.status(500).send("서버 오류");
  }
});

//출결현황 보고서
exports.attendanceReport = asyncHandler(async (req, res) => {
  const student_id = req.params.student_id;
  try {
    const student = await Student.findOne({
      student_id: student_id,
    }).populate("class_id");

    const studentRecord = await StudentRecord.findOne({
      student_id: student_id,
    });

    if (!studentRecord) {
      throw new Error("학생 기록이 존재하지 않습니다.");
    }

    const studentAttendance = await Attendance.find({
      _id: { $in: studentRecord.attendance_id },
    });

    // date 기준 오름차순 정렬
    studentAttendance.sort((a, b) => new Date(a.date) - new Date(b.date));

    console.log(studentAttendance);

    if (!student) return res.status(404).send("학생을 찾을 수 없습니다.");
    if (!studentAttendance)
      return res.status(404).send("출결현황을 찾을 수 없습니다.");

    // EJS 템플릿 경로
    const templatePath = path.join(__dirname, "../views/attendanceReport.ejs");

    // HTML 렌더링
    const html = await ejs.renderFile(templatePath, {
      student,
      studentAttendance,
    });

    // Puppeteer 실행 (PDF 생성)
    const browser = await puppeteer.launch({
      headless: "new", // 안정성을 위해 'new' 모드 권장
      args: ["--no-sandbox", "--disable-setuid-sandbox"], // 서버 환경 대응
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    const filename = `출결현황보고서(${student.name}_${student.student_id}).pdf`;
    const encodedFilename = encodeURIComponent(filename); // UTF-8 인코딩
    // PDF 전송 헤더
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="attendanceReport-${student.student_id}.pdf"; filename*=UTF-8''${encodedFilename}`
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    // 클라이언트에 전송 (Postman, 브라우저 모두 대응)
    res.end(pdfBuffer);
  } catch (error) {
    console.error("PDF 생성 에러:", error);
    res.status(500).send("서버 오류");
  }
});
