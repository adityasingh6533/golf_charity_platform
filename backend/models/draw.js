const mongoose = require("mongoose");

const drawSchema = new mongoose.Schema({
  numbers: [Number],
  mode: { type: String, enum: ["random", "algorithm"], default: "random" },
  participantCount: { type: Number, default: 0 },
  totalPool: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Draw", drawSchema);
