const DEFAULT_ADMIN_EMAILS = ["admin456@gmail.com"];

const getAdminEmails = () => {
  const configured = String(process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  const allEmails = [...DEFAULT_ADMIN_EMAILS, ...configured];
  return [...new Set(allEmails)];
};

const isAdminEmail = (email) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  return normalizedEmail ? getAdminEmails().includes(normalizedEmail) : false;
};

const applyAdminRole = (user) => {
  if (!user) return user;

  const userObj = typeof user.toObject === "function" ? user.toObject({ getters: false }) : { ...user };
  if (String(userObj.role || "").toLowerCase() === "admin" || isAdminEmail(userObj.email)) {
    userObj.role = "admin";
  }

  return userObj;
};

module.exports = {
  getAdminEmails,
  isAdminEmail,
  applyAdminRole,
};
