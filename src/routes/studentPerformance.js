const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const roles = require("../middlewares/roleMiddleware");
const ctrl = require("../controllers/studentPerformanceController");

/* CREATE (single + bulk) */
router.post(
  "/bulk",
  auth,
  roles("teacher", "center_admin", "ngo_admin", "super_admin"),
  ctrl.bulkUploadStudentPerformance
);

/* READ by roll number */
router.get(
  "/",
  auth,
  ctrl.getByRollNo
);

/* READ center monthly */
router.get(
  "/monthly",
  auth,
  ctrl.getCenterMonthly
);

/* READ single record */
router.get(
  "/:id",
  auth,
  ctrl.getPerformanceById
);

/* DELETE (admin only) */
router.delete(
  "/:id",
  auth,
  roles("ngo_admin", "super_admin"),
  ctrl.deletePerformance
);

module.exports = router;
