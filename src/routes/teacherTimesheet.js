const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const roles = require("../middlewares/roleMiddleware");
const controller = require("../controllers/teacherTimesheetController");

// CREATE
router.post(
  "/",
  auth,
  roles("teacher", "ngo_admin", "center_admin", "super_admin"),
  controller.createTeacherTimesheet
);

// GET
router.get(
  "/",
  auth,
  roles("teacher", "ngo_admin", "center_admin", "super_admin"),
  controller.getTeacherTimesheets
);

// UPDATE
router.put(
  "/:id",
  auth,
  roles("teacher", "ngo_admin", "center_admin", "super_admin"),
  controller.updateTeacherTimesheet
);

// DELETE
router.delete(
  "/:id",
  auth,
  roles("teacher","ngo_admin", "center_admin", "super_admin"),
  controller.deleteTeacherTimesheet
);

module.exports = router;
