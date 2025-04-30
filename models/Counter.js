const mongoose = require("mongoose");

const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sequence_value: { type: Number, default: 1 },
});

module.exports =
  mongoose.models.Counter || mongoose.model("Counter", CounterSchema);
