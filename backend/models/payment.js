const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    plan: { type: String, enum: ["monthly", "yearly"], required: true },
    type: { type: String, enum: ["activation", "renewal"], default: "activation" },
    gateway: { type: String, default: "mock-stripe-local" },
    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, default: "INR" },
    status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    transactionRef: { type: String, required: true, unique: true },
    paidAt: { type: Date, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", paymentSchema);
