const mongoose = require("mongoose");
const Class = require("../models/Class");

mongoose
  .connect(
    "mongodb+srv://kgs9843:rlarltn9843@cluster0.npsmpmi.mongodb.net/COSY"
  )
  .then(async () => {
    await Class.insertOne({
      grade: 2,
      class: 3,
      year: 2024,
      teacher_id: 1001,
    });
  });
