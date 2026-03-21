const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  scores: [Number], // last 5 scores
  entries: [
    {
      value: { type: Number, required: true },
      date: { type: Date, required: true }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Score", scoreSchema);
