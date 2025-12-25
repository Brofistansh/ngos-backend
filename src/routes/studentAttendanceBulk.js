const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");
const ctrl = require("../controllers/studentAttendanceBulkController");

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
  "/:id",
  auth,
  role("center_admin", "ngo_admin", "super_admin"),
  ctrl.updateAttendance
);

router.delete(
  "/:id",
  auth,
  role("ngo_admin", "super_admin"),
  ctrl.deleteAttendance
);

module.exports = router;
