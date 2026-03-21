const isProduction = process.env.NODE_ENV === "production";
const allowInsecureHttp = String(process.env.ALLOW_INSECURE_HTTP || "").toLowerCase() === "true";

const requestIsSecure = (req) => {
  if (req.secure) return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (typeof forwardedProto === "string") {
    return forwardedProto.split(",")[0].trim() === "https";
  }

  return false;
};

const enforceHttps = (req, res, next) => {
  if (!isProduction || allowInsecureHttp || requestIsSecure(req)) {
    return next();
  }

  const host = req.headers.host;
  if (!host) {
    return res.status(400).json({ message: "HTTPS is required" });
  }

  return res.redirect(301, `https://${host}${req.originalUrl}`);
};

const applySecurityHeaders = (req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  if (isProduction) {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  next();
};

module.exports = {
  enforceHttps,
  applySecurityHeaders,
};
