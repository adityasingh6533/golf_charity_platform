const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Charity = require("../models/charity");
const { setUser } = require("../service/auth");
const { sendWelcomeNotification } = require("../service/notifications");

const sanitizeUser = (user) => {
  if (!user) return null;
  const userObj = user.toObject({ getters: false });
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

    if (!firstName || !lastName || !username || !email || !password || !charityId) {
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

    if (charityId) {
      const charity = await Charity.findById(charityId);
      if (!charity) {
        return res.status(404).json({ message: "Selected charity not found" });
      }
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
        charityId,
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
