const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    charityId: { type: mongoose.Schema.Types.ObjectId, ref: "Charity", required: true },
    donorName: { type: String, default: "Anonymous" },
    donorEmail: { type: String, default: "" },
    amount: { type: Number, required: true, min: 1 },
    note: { type: String, default: "" },
    source: { type: String, enum: ["independent", "subscription"], default: "independent" }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Donation", donationSchema);
