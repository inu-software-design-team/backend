const mongoose = require(mongoose);

const ParentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    gender: { type: String, required: true },
    child_name: { type: String, required: true },
    child_id: { type: mongoose.Schema.Types.ObjectId, ref: "Student" }
});

module.exports = mongoose.model("Parent", ParentSchema);