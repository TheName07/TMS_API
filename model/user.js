const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  full_name: { type: String, default: null },
  std: { type: Number, default: null },
  username: { type: String, unique: true },
  password: { type: String },
  sub:{type: Array},
  token: { type: String },
},{collection : "Students"});

module.exports = mongoose.model("user", userSchema);