const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const { requireLogin, requireAdmin, allowRoles } = require("../middleware/auth");

router.get("/me", requireLogin, userController.getCurrentUser);
router.get("/", requireLogin, allowRoles(["admin"]), userController.getAllUsers);
router.put("/:id/subscription", requireLogin, userController.updateSubscription);
router.put("/:id/charity", requireLogin, userController.updateCharityPreference);
router.get("/:id", requireLogin, userController.getUserById);
router.post("/", requireLogin, requireAdmin, userController.createUser);
router.put("/:id", requireLogin, userController.updateUser);
router.delete("/:id", requireLogin, requireAdmin, userController.deleteUser);

module.exports = router;
