const mongoose = require("mongoose");
const Class = require("../models/Class");

mongoose
  .connect(
    "mongodb+srv://kgs9843:rlarltn9843@cluster0.npsmpmi.mongodb.net/COSY"
  )
  .then(async () => {
    await Class.insertOne({
      grade: 3,
      class: 2,
      year: 2025,
      teacher_id: 1001,
    });

    await Class.insertOne({
      grade: 2,
      class: 5,
      year: 2025,
      teacher_id: 1002,
    });
  });
