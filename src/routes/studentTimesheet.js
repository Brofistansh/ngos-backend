const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const roles = require("../middlewares/roleMiddleware");
const controller = require("../controllers/studentTimesheetController");

// Teacher + Admin can create timesheet
router.post(
  "/",
  auth,
  roles("teacher", "ngo_admin", "center_admin", "super_admin"),
  controller.createStudentTimesheet
);

module.exports = router;
