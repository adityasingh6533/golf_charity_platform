const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  matches: Number,
  prize: Number,
  status: {
    type: String,
    enum: ["pending", "verified", "paid", "won", "lost", "rejected"],
    default: "pending"
  },
  proofUrl: { type: String, default: "" },
  proofNote: { type: String, default: "" },
  adminNote: { type: String, default: "" },
  reviewedAt: { type: Date, default: null },
  payoutCompletedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  draw: [Number]
});

module.exports = mongoose.model("Result", resultSchema);
