
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  subscription: {
    plan: { type: String, enum: ["monthly", "yearly"], default: "monthly" },
    status: { type: String, enum: ["inactive", "active", "cancelled", "lapsed"], default: "inactive" },
    amount: { type: Number, default: 100 },
    startedAt: { type: Date, default: null },
    renewalDate: { type: Date, default: null },
    autoRenew: { type: Boolean, default: true }
  },
  charity: {
    charityId: { type: mongoose.Schema.Types.ObjectId, ref: "Charity", default: null },
    contributionPercent: { type: Number, default: 10 }
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;
