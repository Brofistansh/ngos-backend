const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const roles = require("../middlewares/roleMiddleware");
const controller = require("../controllers/stockController");

// CREATE → ONLY TEACHER
router.post(
  "/",
  auth,
  roles("teacher"),
  controller.createStock
);

// GET → TEACHER / MANAGER / ADMIN
router.get(
  "/",
  auth,
  roles("teacher", "center_admin", "ngo_admin", "super_admin"),
  controller.getStock
);

module.exports = router;
