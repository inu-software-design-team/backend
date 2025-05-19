const mongoose = require("mongoose");
const Parent = require("../models/Parent");

mongoose
  .connect(
    "mongodb+srv://kgs9843:rlarltn9843@cluster0.npsmpmi.mongodb.net/COSY"
  )
  .then(async () => {
    await Parent.insertOne({
      child_id: [2001],
      name: "김모지",
      gender: "여자",
      phone: "010-5522-8878",
      occupation: "서버개발자",
    });
  });
