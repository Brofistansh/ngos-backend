// src/routes/activityTypeRoutes.js

const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");
const controller = require("../controllers/activityTypeController");

// 🔽 Dropdown API
router.get(
  "/",
  auth,
  role("teacher", "center_admin", "ngo_admin", "super_admin"),
  controller.getActivityTypes
);

module.exports = router;
