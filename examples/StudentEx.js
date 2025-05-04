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
      address: "인천광역시 연수구 연수동",
      phone: "010-3245-6574",
      class_id: "68176e5d84223682274493b7",
      class_history: null,
    });

    await Student.insertOne({
      student_id: 2002,
      name: "이서윤",
      gender: "여자",
      registration_number: "031156-2545678",
      address: "인천광역시 연수구 송도동",
      phone: "010-3226-9870",
      class_id: "68176e5d84223682274493b7",
      class_history: null,
    });

    await Student.insertOne({
      student_id: 2003,
      name: "박지후",
      gender: "남자",
      registration_number: "030512-3156790",
      address: "인천광역시 연수구 동춘동동",
      phone: "010-1235-6374",
      class_id: "68176e5d84223682274493b7",
      class_history: null,
    });

    await Student.insertOne({
      student_id: 2004,
      name: "최하은",
      gender: "여자",
      registration_number: "030312-2453241",
      address: "인천광역시 연수구 옥련동",
      phone: "010-23454-6504",
      class_id: "68176e5d84223682274493b7",
      class_history: null,
    });

    await Student.insertOne({
      student_id: 2005,
      name: "정도윤",
      gender: "남자",
      registration_number: "031204-3543674",
      address: "서울특별시 강남구 논현동",
      phone: "010-1984-2435",
      class_id: "68176e5d84223682274493b7",
      class_history: null,
    });

    await Student.insertOne({
      student_id: 2006,
      name: "한예린",
      gender: "여자",
      registration_number: "030214-2124246",
      address: "경기도 시흥시",
      phone: "010-3047-9486",
      class_id: "68176e5d84223682274493b7",
      class_history: null,
    });

    await Student.insertOne({
      student_id: 2007,
      name: "오준서",
      gender: "남자",
      registration_number: "030121-3645198",
      address: "인천광역시 남동구 가산동",
      phone: "010-9765-3671",
      class_id: "68176e5d84223682274493b7",
      class_history: null,
    });

    await Student.insertOne({
      student_id: 2008,
      name: "윤지아",
      gender: "여자",
      registration_number: "031115-2453423",
      address: "경기도 수원시 성화동",
      phone: "010--3452-8761",
      class_id: "68176e5d84223682274493b7",
      class_history: null,
    });

    await Student.insertOne({
      student_id: 2009,
      name: "강도현",
      gender: "남자",
      registration_number: "030912-3456981",
      address: "인천광역시 서구 서울동",
      phone: "010-1187-9812",
      class_id: "68176e5d84223682274493b7",
      class_history: null,
    });

    await Student.insertOne({
      student_id: 2010,
      name: "조하율",
      gender: "여자",
      registration_number: "030812-2314981",
      address: "인천광역시 미추홀구 미추홀동",
      phone: "010-3212-1231",
      class_id: "68176e5d84223682274493b7",
      class_history: null,
    });
  });
