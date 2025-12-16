const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const roles = require("../middlewares/roleMiddleware");
const controller = require("../controllers/studentAttendanceController");

// 🔒 Mark attendance
router.post(
  "/",
  auth,
  roles("super_admin", "ngo_admin", "center_admin"),
  controller.createAttendance
);

// 📥 Get attendance (filters supported)
router.get(
  "/",
  auth,
  roles("super_admin", "ngo_admin", "center_admin"),
  controller.getAttendance
);

// ✏️ Update attendance
router.put(
  "/:id",
  auth,
  roles("super_admin", "ngo_admin", "center_admin"),
  controller.updateAttendance
);

// ❌ Delete attendance
router.delete(
  "/:id",
  auth,
  roles("super_admin", "ngo_admin"),
  controller.deleteAttendance
);

module.exports = router;
