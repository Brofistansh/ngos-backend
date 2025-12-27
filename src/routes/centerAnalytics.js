const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const ctrl = require("../controllers/centerAnalyticsController");

router.get(
  "/center/:centerId",
  auth,
  ctrl.getCenterAnalytics
);

module.exports = router;
