const express = require("express");
const router = express.Router();
const { requireLogin, requireAdmin } = require("../middleware/auth");
const drawController = require("../controllers/draw");

router.post("/run-draw", requireLogin, requireAdmin, drawController.runDraw);

module.exports = router;
