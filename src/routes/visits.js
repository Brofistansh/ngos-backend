const express = require("express");
const router = express.Router();

const visitController = require("../controllers/visitController");
const auth = require("../middlewares/authMiddleware");
const roles = require("../middlewares/roleMiddleware");

const allowedRoles = ["super_admin", "ngo_admin", "center_admin", "teacher"];

router.post("/", auth, roles(...allowedRoles), visitController.createVisit);
router.get("/", auth, roles(...allowedRoles), visitController.getVisits);
router.get("/:id", auth, roles(...allowedRoles), visitController.getVisitById);
router.put("/:id", auth, roles(...allowedRoles), visitController.updateVisit);
router.delete("/:id", auth, roles(...allowedRoles), visitController.deleteVisit);

module.exports = router;
