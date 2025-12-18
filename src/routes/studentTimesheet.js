const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const roles = require("../middlewares/roleMiddleware");
const controller = require("../controllers/studentTimesheetController");

// CREATE
router.post(
  "/",
  auth,
  roles("teacher", "ngo_admin", "center_admin", "super_admin"),
  controller.createStudentTimesheet
);

// UPDATE
router.put(
  "/:id",
  auth,
  roles("teacher", "ngo_admin", "center_admin", "super_admin"),
  controller.updateStudentTimesheet
);

// GET
router.get(
  "/",
  auth,
  roles("teacher", "ngo_admin", "center_admin", "super_admin"),
  controller.getStudentTimesheets
);

// DELETE
router.delete(
  "/:id",
  auth,
  roles("ngo_admin", "center_admin", "super_admin"),
  controller.deleteStudentTimesheet
);

module.exports = router;
