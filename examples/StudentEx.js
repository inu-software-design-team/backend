const mongoose = require("mongoose");
const Student = require("../models/Student");

mongoose
  .connect(
    "mongodb+srv://kgs9843:rlarltn9843@cluster0.npsmpmi.mongodb.net/COSY"
  )
  .then(async () => {
    await Student.insertOne({
      student_id: 2001,
      name: "김민준",
      gender: "남자",
      registration_number: "031214-3124546",
      class_id: "68176e5d84223682274493b7",
      class_history: null,
    });

    await Student.insertOne({
      student_id: 2002,
      name: "이서윤",
      gender: "여자",
      registration_number: "031156-2545678",
      class_id: "68176e5d84223682274493b7",
      class_history: null,
    });

    await Student.insertOne({
      student_id: 2003,
      name: "박지후",
      gender: "남자",
      registration_number: "030512-3156790",
      class_id: "68176e5d84223682274493b7",
      class_history: null,
    });

    await Student.insertOne({
      student_id: 2004,
      name: "최하은",
      gender: "여자",
      registration_number: "030312-2453241",
      class_id: "68176e5d84223682274493b7",
      class_history: null,
    });

    await Student.insertOne({
      student_id: 2005,
      name: "정도윤",
      gender: "남자",
      registration_number: "031204-3543674",
      class_id: "68176e5d84223682274493b7",
      class_history: null,
    });

    await Student.insertOne({
      student_id: 2006,
      name: "한예린",
      gender: "여자",
      registration_number: "030214-2124246",
      class_id: "68176e5d84223682274493b7",
      class_history: null,
    });

    await Student.insertOne({
      student_id: 2007,
      name: "오준서",
      gender: "남자",
      registration_number: "030121-3645198",
      class_id: "68176e5d84223682274493b7",
      class_history: null,
    });

    await Student.insertOne({
      student_id: 2008,
      name: "윤지아",
      gender: "여자",
      registration_number: "031115-2453423",
      class_id: "68176e5d84223682274493b7",
      class_history: null,
    });

    await Student.insertOne({
      student_id: 2009,
      name: "강도현",
      gender: "남자",
      registration_number: "030912-3456981",
      class_id: "68176e5d84223682274493b7",
      class_history: null,
    });

    await Student.insertOne({
      student_id: 2010,
      name: "조하율",
      gender: "여자",
      registration_number: "030812-2314981",
      class_id: "68176e5d84223682274493b7",
      class_history: null,
    });
  });
