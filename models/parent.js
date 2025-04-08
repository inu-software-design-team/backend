const mongoose = require(mongoose);

const ParentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    gender: { type: String, required: true },
    child_name: { type: String, required: true },
    child_id: {
        type: Number,
        required: true
    }
});

ParentSchema.virtual("student", {
    ref: "Student",
    localField: "student_id",
    foreignField: "student_id",
    justOne: true
})

module.exports = mongoose.model("Parent", ParentSchema);