const mongoose = require("mongoose");

const ParentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gender: { type: String, required: true },
  child: { type: [Number], required: true },
});

module.exports =
  mongoose.models.Parent || mongoose.model("Parent", ParentSchema);
