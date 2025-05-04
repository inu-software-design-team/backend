const mongoose = require("mongoose");
const Teacher = require("../models/Teacher");

mongoose
  .connect(
    "mongodb+srv://kgs9843:rlarltn9843@cluster0.npsmpmi.mongodb.net/COSY"
  )
  .then(async () => {
    await Teacher.insertOne({
      teacher_id: 1001,
      name: "김철수",
      gender: "남자",
      subject: "수학",
    });

    await Teacher.insertOne({
      teacher_id: 1002,
      name: "김영희",
      gender: "여자",
      subject: "영어",
    });
  });
