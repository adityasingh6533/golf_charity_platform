const express = require("express");
const router = express.Router();
const { requireLogin, requireAdmin } = require("../middleware/auth");
const {
  runDraw,
  getAllUsers,
  getAllResults,
  getAnalytics,
  verifyWinner,
  rejectWinner,
  markAsPaid,
} = require("../controllers/admin");

router.post("/run-draw", requireLogin, requireAdmin, runDraw);
router.get("/users", requireLogin, requireAdmin, getAllUsers);
router.get("/results", requireLogin, requireAdmin, getAllResults);
router.get("/analytics", requireLogin, requireAdmin, getAnalytics);
router.put("/verify/:id", requireLogin, requireAdmin, verifyWinner);
router.put("/reject/:id", requireLogin, requireAdmin, rejectWinner);
router.put("/pay/:id", requireLogin, requireAdmin, markAsPaid);

module.exports = router;
