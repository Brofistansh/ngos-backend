const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const roles = require("../middlewares/roleMiddleware");
const ctrl = require("../controllers/studentPerformanceController");

router.post("/", auth, roles("teacher","ngo_admin","center_admin","super_admin"), ctrl.createStudentPerformanceReport);

router.get("/", auth, ctrl.getReportsByStudent);

router.get("/:id", auth, ctrl.getReportById);

router.put("/:id", auth, roles("teacher","ngo_admin"), ctrl.updateReport);

router.delete("/:id", auth, roles("ngo_admin","super_admin"), ctrl.deleteReport);

module.exports = router;
