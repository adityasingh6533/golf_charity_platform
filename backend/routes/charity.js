const express = require("express");
const router = express.Router();
const charityController = require("../controllers/charity");
const { requireLogin, attachUserIfPresent, requireAdmin } = require("../middleware/auth");

router.get("/", charityController.getCharities);
router.get("/featured", charityController.getFeaturedCharities);
router.get("/:id", charityController.getCharityById);
router.post("/donations", attachUserIfPresent, charityController.createDonation);
router.post("/", requireLogin, requireAdmin, charityController.createCharity);
router.put("/:id", requireLogin, requireAdmin, charityController.updateCharity);
router.delete("/:id", requireLogin, requireAdmin, charityController.deleteCharity);

module.exports = router;
