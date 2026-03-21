const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "please-change-this-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const setUser = (user) => {
  if (!user) {
    throw new Error("User object is required to build a token");
  }

  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email?.toLowerCase(),
      role: user.role
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN
    }
  );
};

const getUser = (token) => {
  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  setUser,
  getUser
};
