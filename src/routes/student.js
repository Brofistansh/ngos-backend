const express = require("express");
const router = express.Router();

const studentController = require("../controllers/studentController");
const auth = require("../middlewares/authMiddleware");
const roles = require("../middlewares/roleMiddleware");

// Multer for file upload
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

// SUPER ADMIN + NGO ADMIN + CENTER ADMIN can manage students
const allowedRoles = ["super_admin", "ngo_admin", "center_admin"];

router.post(
  "/",
  auth,
  roles(...allowedRoles),
  upload.single("student_photo"),
  studentController.createStudent
);

router.get(
  "/",
  auth,
  roles(...allowedRoles),
  studentController.getStudents
);

router.put(
  "/:id",
  auth,
  roles(...allowedRoles),
  upload.single("student_photo"),
  studentController.updateStudent
);

router.delete(
  "/:id",
  auth,
  roles(...allowedRoles),
  studentController.deleteStudent
);
router.get('/:id', getStudentById);
module.exports = router;
