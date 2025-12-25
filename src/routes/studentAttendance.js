const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");
const controller = require("../controllers/studentAttendanceController");

router.post(
  "/",
  auth,
  role("teacher", "center_admin", "ngo_admin", "super_admin"),
  controller.createBulkAttendance
);

router.get(
  "/",
  auth,
  role("teacher", "center_admin", "ngo_admin", "super_admin"),
  controller.getAttendance
);

router.put(
  "/:id",
  auth,
  role("teacher", "center_admin", "ngo_admin", "super_admin"),
  controller.updateAttendance
);

router.delete(
  "/:id",
  auth,
  role("center_admin", "ngo_admin", "super_admin"),
  controller.deleteAttendance
);

module.exports = router;


// const express = require('express');
// const router = express.Router();

// const auth = require('../middlewares/authMiddleware');
// const requireRole = require('../middlewares/roleMiddleware');
// const controller = require('../controllers/studentAttendanceLegacyController');

// router.post(
//   '/',
//   auth,
//   requireRole('teacher', 'center_admin', 'ngo_admin', 'super_admin'),
//   controller.createAttendance
// );

// router.get(
//   '/',
//   auth,
//   requireRole('teacher', 'center_admin', 'ngo_admin', 'super_admin'),
//   controller.getAttendance
// );

// router.put(
//   '/:id',
//   auth,
//   requireRole('teacher', 'center_admin', 'ngo_admin', 'super_admin'),
//   controller.updateAttendance
// );

// router.delete(
//   '/:id',
//   auth,
//   requireRole('center_admin', 'ngo_admin', 'super_admin'),
//   controller.deleteAttendance
// );

// module.exports = router;
