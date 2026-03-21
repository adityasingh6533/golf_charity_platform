const User = require("../models/user");
const { getUser } = require("../service/auth");
const { syncSubscriptionState } = require("../service/subscription");

const buildRequestUser = async (decoded) => {
  const user = await User.findById(decoded.id).populate("charity.charityId");

  if (!user) {
    return null;
  }

  const syncedUser = await syncSubscriptionState(user);

  return {
    id: syncedUser._id.toString(),
    _id: syncedUser._id.toString(),
    email: syncedUser.email,
    role: syncedUser.role,
    subscription: syncedUser.subscription,
    charity: syncedUser.charity,
  };
};

const decodeRequestUser = async (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  const decoded = getUser(token);

  if (!decoded) {
    return null;
  }

  return buildRequestUser(decoded);
};

const requireLogin = async (req, res, next) => {
  try {
    const requestUser = await decodeRequestUser(req);

    if (!requestUser) {
      return res.status(401).json({ message: "Login required" });
    }

    req.user = requestUser;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message || "Unable to authenticate" });
  }
};

const attachUserIfPresent = async (req, res, next) => {
  try {
    const requestUser = await decodeRequestUser(req);
    if (requestUser) {
      req.user = requestUser;
    }
    next();
  } catch (error) {
    next();
  }
};

const requireAdmin = (req, res, next) => {
  if (String(req.user?.role || "").toLowerCase() !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

const allowRoles = (roles) => {
  return (req, res, next) => {
    const userRole = String(req.user?.role || "").toLowerCase();
    const normalizedRoles = roles.map((role) => String(role).toLowerCase());

    if (!normalizedRoles.includes(userRole)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};

const requireActiveSubscription = (req, res, next) => {
  const status = String(req.user?.subscription?.status || "").toLowerCase();

  if (status !== "active") {
    return res.status(403).json({ message: "Active subscription required" });
  }

  next();
};

module.exports = {
  requireLogin,
  attachUserIfPresent,
  requireAdmin,
  allowRoles,
  requireActiveSubscription,
};
