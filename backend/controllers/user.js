const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Charity = require("../models/charity");
const { PLAN_AMOUNTS } = require("../service/draw");

const sanitizeUser = (user) => {
  if (!user) return null;
  const userObj = user.toObject ? user.toObject({ getters: false }) : { ...user };
  delete userObj.passwordHash;
  delete userObj.__v;
  return userObj;
};

const isOwnerOrAdmin = (req, targetId) => {
  const actorRole = String(req.user?.role || "").toLowerCase();
  const actorId = String(req.user?.id || req.user?._id || "");
  return actorRole === "admin" || actorId === String(targetId);
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-passwordHash -__v")
      .populate("charity.charityId", "name category");

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-passwordHash -__v")
      .populate("charity.charityId");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    if (!isOwnerOrAdmin(req, req.params.id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findById(req.params.id)
      .select("-passwordHash -__v")
      .populate("charity.charityId");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const input = { ...req.body };

    if (input.password) {
      input.passwordHash = await bcrypt.hash(input.password, 10);
      delete input.password;
    }

    const user = new User(input);
    const savedUser = await user.save();
    res.status(201).json(sanitizeUser(savedUser));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    if (!isOwnerOrAdmin(req, req.params.id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updates = { ...req.body };

    if (updates.password) {
      updates.passwordHash = await bcrypt.hash(updates.password, 10);
      delete updates.password;
    }

    delete updates.passwordHash;

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
      .select("-passwordHash -__v")
      .populate("charity.charityId");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateSubscription = async (req, res) => {
  try {
    if (!isOwnerOrAdmin(req, req.params.id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const plan = String(req.body.plan || "monthly").toLowerCase();
    const status = String(req.body.status || "active").toLowerCase();
    const autoRenew = req.body.autoRenew !== false;

    if (!PLAN_AMOUNTS[plan]) {
      return res.status(400).json({ message: "Invalid subscription plan" });
    }

    const startedAt = req.body.startedAt ? new Date(req.body.startedAt) : new Date();
    const renewalDate = req.body.renewalDate
      ? new Date(req.body.renewalDate)
      : new Date(
          startedAt.getTime() + (plan === "yearly" ? 365 : 30) * 24 * 60 * 60 * 1000
        );

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        subscription: {
          plan,
          status,
          amount: PLAN_AMOUNTS[plan],
          startedAt,
          renewalDate,
          autoRenew,
        },
      },
      { new: true, runValidators: true }
    )
      .select("-passwordHash -__v")
      .populate("charity.charityId");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateCharityPreference = async (req, res) => {
  try {
    if (!isOwnerOrAdmin(req, req.params.id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const charityId = req.body.charityId || null;
    const contributionPercent = Number(req.body.contributionPercent || 10);

    if (charityId) {
      const charity = await Charity.findById(charityId);
      if (!charity) {
        return res.status(404).json({ message: "Charity not found" });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        charity: {
          charityId,
          contributionPercent,
        },
      },
      { new: true, runValidators: true }
    )
      .select("-passwordHash -__v")
      .populate("charity.charityId");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
