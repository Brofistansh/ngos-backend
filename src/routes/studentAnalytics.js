const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const ctrl = require("../controllers/studentAnalyticsController");

router.get(
  "/student/:rollNo",
  auth,
  ctrl.getStudentAnalytics
);

module.exports = router;
