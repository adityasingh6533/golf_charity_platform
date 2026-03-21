const express = require("express");
const router = express.Router();
const { requireLogin, requireActiveSubscription } = require("../middleware/auth");
const resultController = require("../controllers/result");

router.get("/leaderboard", resultController.getLeaderboard);
router.put("/:resultId/proof", requireLogin, requireActiveSubscription, resultController.submitWinnerProof);
router.get("/:userId", requireLogin, requireActiveSubscription, resultController.getUserResults);

module.exports = router;
