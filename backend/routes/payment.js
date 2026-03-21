const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment");
const { requireLogin } = require("../middleware/auth");

router.get("/me", requireLogin, paymentController.getMyPayments);
router.post("/checkout", requireLogin, paymentController.checkout);

module.exports = router;
