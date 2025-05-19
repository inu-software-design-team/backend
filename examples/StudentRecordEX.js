const mongoose = require("mongoose");
const StudentRecord = require("../models/StudentRecord");

mongoose
  .connect(
    "mongodb+srv://kgs9843:rlarltn9843@cluster0.npsmpmi.mongodb.net/COSY"
  )
  .then(async () => {
    const dummyRecord = {
      class_id: new mongoose.Types.ObjectId("68176e5d84223682274493b7"),
      student_id: 2001,
      attendance_id: [
        new mongoose.Types.ObjectId("6829f52b4197bec46a4a451f"),
        new mongoose.Types.ObjectId("6829f52b4197bec46a4a4520"),
        new mongoose.Types.ObjectId("6829f52b4197bec46a4a4521"),
        new mongoose.Types.ObjectId("6829f52b4197bec46a4a4522"),
        new mongoose.Types.ObjectId("6829f52b4197bec46a4a4523"),
        new mongoose.Types.ObjectId("6829f52b4197bec46a4a4524"),
        new mongoose.Types.ObjectId("6829f52b4197bec46a4a4525"),
        new mongoose.Types.ObjectId("6829f52b4197bec46a4a4526"),
        new mongoose.Types.ObjectId("6829f52b4197bec46a4a4527"),
        new mongoose.Types.ObjectId("6829f52b4197bec46a4a4528"),
      ],
      remarks_id: [
        new mongoose.Types.ObjectId("6829fb0af95913de5ccbb5e2"),
        new mongoose.Types.ObjectId("6829fb0af95913de5ccbb5e3"),
        new mongoose.Types.ObjectId("6829fb0af95913de5ccbb5e4"),
        new mongoose.Types.ObjectId("6829fb0af95913de5ccbb5e5"),
        new mongoose.Types.ObjectId("6829fb0af95913de5ccbb5e6"),
      ],
    };

    await StudentRecord.create(dummyRecord);
    console.log("✅ StudentRecord 더미 데이터 삽입 완료");
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("❌ MongoDB 연결 오류:", err);
  });
