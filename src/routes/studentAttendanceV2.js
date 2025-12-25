const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");
const ctrl = require("../controllers/studentAttendanceV2Controller");

router.post(
  "/",
  auth,
  role("teacher", "center_admin", "ngo_admin", "super_admin"),
  ctrl.createBulkAttendance
);

router.get(
  "/",
  auth,
  role("teacher", "center_admin", "ngo_admin", "super_admin"),
  ctrl.getAttendance
);

router.put(
  "/entry/:id",
  auth,
  role("teacher", "center_admin", "ngo_admin", "super_admin"),
  ctrl.updateAttendanceEntry
);

router.delete(
  "/entry/:id",
  auth,
  role("center_admin", "ngo_admin", "super_admin"),
  ctrl.deleteAttendanceEntry
);

module.exports = router;
