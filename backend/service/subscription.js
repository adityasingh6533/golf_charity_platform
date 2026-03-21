const User = require("../models/user");
const Payment = require("../models/payment");

const PLAN_DAYS = {
  monthly: 30,
  yearly: 365,
};

const PLAN_AMOUNTS = {
  monthly: 100,
  yearly: 1000,
};

const addDays = (date, days) => {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
};

const createTransactionRef = (plan) => {
  return `LOCAL-${plan.toUpperCase()}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
};

const syncSubscriptionState = async (userInput) => {
  if (!userInput) return null;

  const user = userInput._id ? userInput : await User.findById(userInput);
  if (!user) return null;

  const subscription = user.subscription || {};
  const status = String(subscription.status || "inactive").toLowerCase();
  const plan = subscription.plan || "monthly";
  const renewalDate = subscription.renewalDate ? new Date(subscription.renewalDate) : null;
  const now = new Date();
  let changed = false;

  if (renewalDate && renewalDate <= now) {
    if (status === "active" && subscription.autoRenew) {
      const amount = PLAN_AMOUNTS[plan] || PLAN_AMOUNTS.monthly;
      const payment = await Payment.create({
        userId: user._id,
        plan,
        type: "renewal",
        amount,
        status: "paid",
        transactionRef: createTransactionRef(plan),
        paidAt: now,
        metadata: { autoRenew: true },
      });

      user.subscription.amount = amount;
      user.subscription.startedAt = renewalDate;
      user.subscription.renewalDate = addDays(now, PLAN_DAYS[plan] || PLAN_DAYS.monthly);
      user.subscription.status = "active";
      changed = true;

      if (!payment) {
        user.subscription.status = "lapsed";
      }
    } else if (status === "active" || status === "cancelled") {
      user.subscription.status = "lapsed";
      user.subscription.autoRenew = false;
      changed = true;
    }
  }

  if (changed) {
    await user.save();
  }

  return user;
};

const activateSubscriptionForPayment = async (userId, plan, paymentType = "activation") => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const amount = PLAN_AMOUNTS[plan] || PLAN_AMOUNTS.monthly;
  const now = new Date();
  const renewalDate = addDays(now, PLAN_DAYS[plan] || PLAN_DAYS.monthly);

  user.subscription = {
    plan,
    status: "active",
    amount,
    startedAt: now,
    renewalDate,
    autoRenew: true,
  };

  await user.save();

  const payment = await Payment.create({
    userId: user._id,
    plan,
    type: paymentType,
    amount,
    status: "paid",
    transactionRef: createTransactionRef(plan),
    paidAt: now,
  });

  return { user, payment };
};

module.exports = {
  PLAN_AMOUNTS,
  PLAN_DAYS,
  syncSubscriptionState,
  activateSubscriptionForPayment,
};
