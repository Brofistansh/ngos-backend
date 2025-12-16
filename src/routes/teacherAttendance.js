const express = require("express");
const router = express.Router();

const controller = require("../controllers/teacherAttendanceController");
const auth = require("../middlewares/authMiddleware");
const roles = require("../middlewares/roleMiddleware");

router.post("/", auth, roles("super_admin", "ngo_admin", "center_admin"), controller.createAttendance);
router.get("/", auth, roles("super_admin", "ngo_admin", "center_admin"), controller.getAttendance);
router.put("/:id", auth, roles("super_admin", "ngo_admin", "center_admin"), controller.updateAttendance);
router.delete("/:id", auth, roles("super_admin", "ngo_admin"), controller.deleteAttendance);

module.exports = router;
