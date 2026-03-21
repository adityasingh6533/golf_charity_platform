const Payment = require("../models/payment");
const { PLAN_AMOUNTS, activateSubscriptionForPayment } = require("../service/subscription");

exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.checkout = async (req, res) => {
  try {
    const plan = String(req.body.plan || "monthly").toLowerCase();

    if (!PLAN_AMOUNTS[plan]) {
      return res.status(400).json({ message: "Invalid plan selected" });
    }

    const { user, payment } = await activateSubscriptionForPayment(req.user.id, plan, "activation");

    res.status(201).json({
      message: `${plan === "yearly" ? "Yearly" : "Monthly"} subscription activated successfully`,
      user,
      payment,
      gateway: "mock-stripe-local",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
