const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  tc_name: { type: String, default: null },
  full_name: { type: String, default: null },
  email: { type: String, unique: true },
  password: { type: String },
  sub:{type: Array, default : null},
  std:{type: Array, default : null},
  token: { type: String },
},{collection : "Teachers"}); 

module.exports = mongoose.model("teachers", userSchema);