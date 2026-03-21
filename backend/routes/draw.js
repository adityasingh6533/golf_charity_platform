const express = require("express");
const router = express.Router();
const { requireLogin, requireActiveSubscription } = require("../middleware/auth");
const drawController = require("../controllers/draw");

router.post("/run-draw", requireLogin, requireActiveSubscription, drawController.runDraw);

module.exports = router;
