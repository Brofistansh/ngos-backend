const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const roles = require("../middlewares/roleMiddleware");
const controller = require("../controllers/centerActivityController");

router.post(
  "/",
  auth,
  roles("teacher", "center_admin", "ngo_admin", "super_admin"),
  controller.createActivity
);

router.get(
  "/",
  auth,
  roles("teacher", "center_admin", "ngo_admin", "super_admin"),
  controller.getActivities
);

router.get(
  "/:id",
  auth,
  roles("teacher", "center_admin", "ngo_admin", "super_admin"),
  controller.getActivityById
);

router.put(
  "/:id",
  auth,
  roles("center_admin", "ngo_admin", "super_admin"),
  controller.updateActivity
);

router.delete(
  "/:id",
  auth,
  roles("ngo_admin", "super_admin"),
  controller.deleteActivity
);

module.exports = router;
