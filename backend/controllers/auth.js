const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/user");
const Charity = require("../models/charity");
const { setUser } = require("../service/auth");
const { applyAdminRole } = require("../service/adminAccess");
const { sendWelcomeNotification } = require("../service/notifications");

const sanitizeUser = (user) => {
  if (!user) return null;
  const userObj = applyAdminRole(user);
  delete userObj.passwordHash;
  delete userObj.__v;
  return userObj;
};

exports.signup = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      username,
      email,
      password,
      charityId,
      contributionPercent = 10,
      subscriptionPlan = "monthly"
    } = req.body;
    const normalizedCharityId = String(charityId || "").trim();

    if (!firstName || !lastName || !username || !email || !password || !normalizedCharityId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: username.trim() }]
    });

    if (existingUser) {
      return res.status(409).json({ message: "Email or username already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    if (!mongoose.Types.ObjectId.isValid(normalizedCharityId)) {
      return res.status(400).json({ message: "Please select a valid charity" });
    }

    const charity = await Charity.findOne({
      _id: normalizedCharityId,
      active: true,
    });

    if (!charity) {
      const availableCharities = await Charity.countDocuments({ active: true });

      return res.status(404).json({
        message:
          availableCharities > 0
            ? "Selected charity is no longer available. Please choose again."
            : "No active charities are available right now.",
      });
    }

    const user = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username: username.trim(),
      email: normalizedEmail,
      passwordHash,
      subscription: {
        plan: subscriptionPlan === "yearly" ? "yearly" : "monthly",
        status: "inactive",
        amount: subscriptionPlan === "yearly" ? 1000 : 100,
        autoRenew: true
      },
      charity: {
        charityId: normalizedCharityId,
        contributionPercent: Math.max(10, Number(contributionPercent || 10))
      }
    });

    const savedUser = await user.save();
    const token = setUser(savedUser);
    sendWelcomeNotification(savedUser);

    res.status(201).json({
      message: "Account created",
      user: sanitizeUser(savedUser),
      token
    });
  } catch (error) {
    console.error("Signup error", error);
    res.status(500).json({ message: "Unable to create account" });
  }
};

exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = setUser(user);

    res.json({
      message: "Signed in successfully",
      user: sanitizeUser(user),
      token
    });
  } catch (error) {
    console.error("Signin error", error);
    res.status(500).json({ message: "Unable to authenticate" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { identifier, newPassword } = req.body;

    if (!identifier || !newPassword) {
      return res.status(400).json({ message: "Username or email and new password are required" });
    }

    if (String(newPassword).length <= 6) {
      return res.status(400).json({ message: "Password must be greater than 6 characters" });
    }

    const normalizedIdentifier = String(identifier).trim();
    const normalizedEmail = normalizedIdentifier.toLowerCase();

    const user = await User.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedIdentifier }],
    });

    if (!user) {
      return res.status(404).json({ message: "No account found with that username or email" });
    }

    user.passwordHash = await bcrypt.hash(String(newPassword), 10);
    await user.save();

    res.json({ message: "Password updated successfully. Please sign in with your new password." });
  } catch (error) {
    console.error("Forgot password error", error);
    res.status(500).json({ message: "Unable to reset password" });
  }
};
