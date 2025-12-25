const express = require("express");
const router = express.Router();

const controller = require("../controllers/dailyCenterReportController");
const auth = require("../middlewares/authMiddleware");
const roles = require("../middlewares/roleMiddleware");

// CREATE – Teacher only
router.post(
  "/",
  auth,
  roles("teacher"),
  controller.createDailyCenterReport
);

// GET – Teacher / Manager / Admin
router.get(
  "/",
  auth,
  roles("teacher", "center_admin", "ngo_admin", "super_admin"),
  controller.getDailyCenterReports
);

module.exports = router;
