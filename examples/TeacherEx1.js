const mongoose = require("mongoose");
const Teacher = require("../models/Teacher");

mongoose
  .connect(
    "mongodb+srv://kgs9843:rlarltn9843@cluster0.npsmpmi.mongodb.net/COSY"
  )
  .then(async () => {
    await Teacher.insertOne({
      teacher_id: 1003,
      name: "고길동",
      gender: "남자",
      subject: "국어",
    });

    await Teacher.insertOne({
      teacher_id: 1004,
      name: "홍길동",
      gender: "남자",
      subject: "과학",
    });

    await Teacher.insertOne({
      teacher_id: 1005,
      name: "박지선",
      gender: "여자",
      subject: "사회",
    });
  });
