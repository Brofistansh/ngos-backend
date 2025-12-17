const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const roles = require("../middlewares/roleMiddleware");
const {
  createStudentTimesheet,
} = require("../controllers/studentTimesheetController");

// ONLY teacher can create
router.post(
  "/",
  auth,
  roles("teacher"),
  createStudentTimesheet
);

module.exports = router;
