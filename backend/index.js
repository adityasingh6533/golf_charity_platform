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

const PORT = process.env.PORT || 5000;
const MONGO_URL =
  (process.env.MONGO_URL || "mongodb://127.0.0.1:27017/golf_charity_platform").trim();

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "Golf charity platform API" });
});

app.use("/api/admin", admin);
app.use("/api/auth", authRoutes);
app.use("/api/charities", charityRoutes);
app.use("/api/draw", drawRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/result", resultRoutes);
app.use("/api/score", scoreRoutes);
app.use("/api/users", userRoutes);

connectToMongoDB(MONGO_URL)
  .then(() => {
    return seedLocalData();
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1);
  });
