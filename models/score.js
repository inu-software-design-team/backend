const counter = require("./counter");

const mongoose = require(mongoose);

const ScoreSchema = new mongoose.Schema({
    id: { type: String, required: true },
    total_score: { type: Number, required: true },
    average: { type: Number, required: true },
    student_id: {
        type : Number,
        required : true,
    },
    semester_id: { type: mongoose.Schema.Types.ObjectId, ref: "Semester" },
    teacher_id: {
        type: Number,
        required : true
    },
    korean: { type: mongoose.Schema.Types.Mixed, required: true },
    math: { type: mongoose.Schema.Types.Mixed, required: true },
    society: { type: mongoose.Schema.Types.Mixed, required: true },
    science: { type: mongoose.Schema.Types.Mixed, required: true }
});

// student_id가 Student 테이블의 student_id 필드와 연결되도록 가상 필드 설정
ScoreSchema.virtual("student", {
    ref: "Student",
    localField: "student_id",
    foreignField: "student_id",
    justOne: true,
})

ScoreSchema.virtual("teacher", {
    ref: "Teacher",
    localField: "teacher_id",
    foreignField: "teacher_id",
    justOne: true,
})

ScoreSchema.pre("save", async function (next) {
    if(this.isNew) {
        try {
            const counter = await counter.findByIdAndUpdate(
                { _id: "score_index "},
                { $inc: { sequence_value: 1 } },
                { new: true, upsert: true }
            );

            this.id = counter.sequence_value;
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

module.exports = mongoose.model("Score", ScoreSchema);