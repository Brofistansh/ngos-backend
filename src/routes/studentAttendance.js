const express = require("express");
const router = express.Router();

const studentAttendanceController = require("../controllers/studentAttendanceController");
const auth = require("../middlewares/authMiddleware");
const roles = require("../middlewares/roleMiddleware");

/**
 * ALLOWED ROLES:
 * - center_admin
 * - ngo_admin
 * - teacher  ✅
 */

// CREATE student attendance
router.post(
  "/",
  auth,
  roles("center_admin", "ngo_admin", "teacher"),
  studentAttendanceController.createAttendance
);

// GET student attendance (filters supported)
router.get(
  "/",
  auth,
  roles("center_admin", "ngo_admin", "teacher"),
  studentAttendanceController.getAttendance
);

// UPDATE attendance
router.put(
  "/:id",
  auth,
  roles("center_admin", "ngo_admin", "teacher"),
  studentAttendanceController.updateAttendance
);

// DELETE attendance (optional — you may restrict this later)
router.delete(
  "/:id",
  auth,
  roles("center_admin", "ngo_admin"),
  studentAttendanceController.deleteAttendance
);

module.exports = router;
