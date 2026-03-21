require("dotenv").config();

const cors = require("cors");
const express = require("express");
const connectToMongoDB = require("./connection");
const authRoutes = require("./routes/auth");
const drawRoutes = require("./routes/draw");
const paymentRoutes = require("./routes/payment");
const resultRoutes = require("./routes/result");
const scoreRoutes = require("./routes/score");
const userRoutes = require("./routes/user");
const admin = require("./routes/admin");
const charityRoutes = require("./routes/charity");
const { seedLocalData } = require("./service/seed");
const { enforceHttps, applySecurityHeaders } = require("./middleware/security");

const MONGO_URL =
  (process.env.MONGO_URL || "mongodb://127.0.0.1:27017/golf_charity_platform").trim();

let bootstrapPromise = null;

const ensureAppReady = async () => {
  if (!bootstrapPromise) {
    bootstrapPromise = connectToMongoDB(MONGO_URL)
      .then(() => seedLocalData())
      .catch((error) => {
        bootstrapPromise = null;
        throw error;
      });
  }

  return bootstrapPromise;
};

const app = express();

app.set("trust proxy", 1);
app.use(enforceHttps);
app.use(applySecurityHeaders);
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(async (req, res, next) => {
  try {
    await ensureAppReady();
    next();
  } catch (error) {
    console.error("App bootstrap failed", error);
    res.status(500).json({ message: "Server startup failed" });
  }
});

app.get("/", (req, res) => {
  res.json({ message: "Golf charity platform API" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/admin", admin);
app.use("/api/auth", authRoutes);
app.use("/api/charities", charityRoutes);
app.use("/api/draw", drawRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/result", resultRoutes);
app.use("/api/score", scoreRoutes);
app.use("/api/users", userRoutes);

module.exports = {
  app,
  ensureAppReady,
};
