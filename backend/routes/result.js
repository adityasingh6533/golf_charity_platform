const express = require("express");
const router = express.Router();
const { requireLogin } = require("../middleware/auth");
const resultController = require("../controllers/result");

router.get("/overview", resultController.getPublicOverview);
router.get("/leaderboard", resultController.getLeaderboard);
router.put("/:resultId/proof", requireLogin, resultController.submitWinnerProof);
router.get("/:userId", requireLogin, resultController.getUserResults);

module.exports = router;
