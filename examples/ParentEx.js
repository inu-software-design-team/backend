const mongoose = require("mongoose");
const Parent = require("../models/Parent");

mongoose
  .connect(
    "mongodb+srv://kgs9843:rlarltn9843@cluster0.npsmpmi.mongodb.net/COSY"
  )
  .then(async () => {
    await Parent.insertOne({
      child_id: [2001],
      name: "김석환",
      gender: "남자",
      phone: "010-5612-8878",
      occupation: "웹개발자",
    });
  });
