const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const roles = require("../middlewares/roleMiddleware");
const controller = require("../controllers/stockController");

// CREATE – Teacher only
router.post(
  "/",
  auth,
  roles("teacher"),
  controller.createStock
);

// GET – Teacher, Manager, Admin
router.get(
  "/",
  auth,
  roles("teacher", "center_admin", "ngo_admin", "super_admin"),
  controller.getStock
);

module.exports = router;
