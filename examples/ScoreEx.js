const mongoose = require("mongoose");
const Score = require("../models/Score");

mongoose
  .connect(
    "mongodb+srv://kgs9843:rlarltn9843@cluster0.npsmpmi.mongodb.net/COSY"
  )
  .then(async () => {
    // await Score.insertOne({
    //   class_id: new mongoose.Types.ObjectId("68184d8ad7b8ac4e399e3935"),
    //   student_id: 2001,
    //   teacher_id: 1001,
    //   korean: {
    //     firstSemester: { midterm: 80, finalterm: 90 },
    //     lastSemester: { midterm: 70, finalterm: 100 },
    //   },
    //   math: {
    //     firstSemester: { midterm: 50, finalterm: 70 },
    //     lastSemester: { midterm: 70, finalterm: 90 },
    //   },
    //   english: {
    //     firstSemester: { midterm: 80, finalterm: 85 },
    //     lastSemester: { midterm: 65, finalterm: 100 },
    //   },
    //   society: {
    //     firstSemester: { midterm: 100, finalterm: 75 },
    //     lastSemester: { midterm: 85, finalterm: 95 },
    //   },
    //   science: {
    //     firstSemester: { midterm: 95, finalterm: 75 },
    //     lastSemester: { midterm: 70, finalterm: 85 },
    //   },
    //   total_score: {
    //     firstSemester: { midterm: 405, finalterm: 395 },
    //     lastSemester: { midterm: 360, finalterm: 470 },
    //   },
    //   average: {
    //     firstSemester: { midterm: 81, finalterm: 79 },
    //     lastSemester: { midterm: 72, finalterm: 94 },
    //   },
    //   year: 2024,
    // });

    // await Score.insertOne({
    //   class_id: new mongoose.Types.ObjectId("68184d8ad7b8ac4e399e3935"),
    //   student_id: 2003,
    //   teacher_id: 1001,
    //   korean: {
    //     firstSemester: { midterm: 85, finalterm: 88 },
    //     lastSemester: { midterm: 90, finalterm: 92 },
    //   },
    //   math: {
    //     firstSemester: { midterm: 78, finalterm: 82 },
    //     lastSemester: { midterm: 85, finalterm: 89 },
    //   },
    //   english: {
    //     firstSemester: { midterm: 92, finalterm: 95 },
    //     lastSemester: { midterm: 88, finalterm: 91 },
    //   },
    //   society: {
    //     firstSemester: { midterm: 80, finalterm: 83 },
    //     lastSemester: { midterm: 86, finalterm: 88 },
    //   },
    //   science: {
    //     firstSemester: { midterm: 88, finalterm: 90 },
    //     lastSemester: { midterm: 91, finalterm: 93 },
    //   },
    //   total_score: {
    //     firstSemester: { midterm: 423, finalterm: 438 },
    //     lastSemester: { midterm: 440, finalterm: 453 },
    //   },
    //   average: {
    //     firstSemester: { midterm: 84.6, finalterm: 87.6 },
    //     lastSemester: { midterm: 88, finalterm: 90.6 },
    //   },
    //   year: 2024,
    // });
    await Score.insertOne({
      class_id: new mongoose.Types.ObjectId("68184d8ad7b8ac4e399e3935"),
      student_id: 2001,
      teacher_id: 1001,
      korean: {
        firstSemester: { midterm: 100, finalterm: 90 },
        lastSemester: { midterm: 100, finalterm: 100 },
      },
      math: {
        firstSemester: { midterm: 100, finalterm: 70 },
        lastSemester: { midterm: 70, finalterm: 90 },
      },
      english: {
        firstSemester: { midterm: 80, finalterm: 85 },
        lastSemester: { midterm: 65, finalterm: 100 },
      },
      society: {
        firstSemester: { midterm: 100, finalterm: 75 },
        lastSemester: { midterm: 85, finalterm: 95 },
      },
      science: {
        firstSemester: { midterm: 95, finalterm: 75 },
        lastSemester: { midterm: 70, finalterm: 85 },
      },
      total_score: {
        firstSemester: { midterm: 405, finalterm: 395 },
        lastSemester: { midterm: 360, finalterm: 470 },
      },
      average: {
        firstSemester: { midterm: 81, finalterm: 79 },
        lastSemester: { midterm: 72, finalterm: 94 },
      },
      year: 2023,
    });
  });
