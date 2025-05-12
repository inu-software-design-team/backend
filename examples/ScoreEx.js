const mongoose = require("mongoose");
const Score = require("../models/Score");

mongoose
  .connect(
    "mongodb+srv://kgs9843:rlarltn9843@cluster0.npsmpmi.mongodb.net/COSY"
  )
  .then(async () => {
    await Score.insertOne({
      class_id: new mongoose.Types.ObjectId("68184d8ad7b8ac4e399e3935"),
      student_id: 2001,
      teacher_id: 1001,
      korean: {
        firstSemester: { midterm: 80, finalterm: 90 },
        lastSemeseter: { midterm: 70, finalterm: 100 },
      },
      math: {
        firstSemester: { midterm: 50, finalterm: 70 },
        lastSemeseter: { midterm: 70, finalterm: 90 },
      },
      english: {
        firstSemester: { midterm: 80, finalterm: 85 },
        lastSemeseter: { midterm: 65, finalterm: 100 },
      },
      society: {
        firstSemester: { midterm: 100, finalterm: 75 },
        lastSemeseter: { midterm: 85, finalterm: 95 },
      },
      science: {
        firstSemester: { midterm: 95, finalterm: 75 },
        lastSemeseter: { midterm: 70, finalterm: 85 },
      },
      total_score: {
        firstSemester: { midterm: 405, finalterm: 395 },
        lastSemeseter: { midterm: 360, finalterm: 470 },
      },
      average: {
        firstSemester: { midterm: 81, finalterm: 79 },
        lastSemeseter: { midterm: 72, finalterm: 94 },
      },
      year: 2024,
    });

    await Score.insertOne({
      class_id: new mongoose.Types.ObjectId("68184d8ad7b8ac4e399e3935"),
      student_id: 2003,
      teacher_id: 1001,
      korean: {
        firstSemester: { midterm: 85, finalterm: 88 },
        lastSemeseter: { midterm: 90, finalterm: 92 },
      },
      math: {
        firstSemester: { midterm: 78, finalterm: 82 },
        lastSemeseter: { midterm: 85, finalterm: 89 },
      },
      english: {
        firstSemester: { midterm: 92, finalterm: 95 },
        lastSemeseter: { midterm: 88, finalterm: 91 },
      },
      society: {
        firstSemester: { midterm: 80, finalterm: 83 },
        lastSemeseter: { midterm: 86, finalterm: 88 },
      },
      science: {
        firstSemester: { midterm: 88, finalterm: 90 },
        lastSemeseter: { midterm: 91, finalterm: 93 },
      },
      total_score: {
        firstSemester: { midterm: 423, finalterm: 438 },
        lastSemeseter: { midterm: 440, finalterm: 453 },
      },
      average: {
        firstSemester: { midterm: 84.6, finalterm: 87.6 },
        lastSemeseter: { midterm: 88, finalterm: 90.6 },
      },
      year: 2024,
    });
  });
