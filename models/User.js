const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  identifier: { type: String, required: true },
  password: { type: String, required: true },
  linked: { type: [Number], required: true },
  role: { type: String, required: true },
});

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
