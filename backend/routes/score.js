const express = require("express");
const router = express.Router();
const { requireLogin, requireActiveSubscription } = require("../middleware/auth");
const scoreController = require("../controllers/score");

router.post("/", requireLogin, requireActiveSubscription, scoreController.saveScore);
router.get("/:userId", requireLogin, scoreController.getUserScores);

module.exports = router;
