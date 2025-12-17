const express = require("express");
const router = express.Router();

const studentController = require("../controllers/studentController");
const auth = require("../middlewares/authMiddleware");
const roles = require("../middlewares/roleMiddleware");

// Multer for file upload
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

// Roles allowed to manage students
const allowedRoles = ["super_admin", "ngo_admin", "center_admin"];

// CREATE student
router.post(
  "/",
  auth,
  roles(...allowedRoles),
  upload.single("student_photo"),
  studentController.createStudent
);

// GET all students
router.get(
  "/",
  auth,
  roles(...allowedRoles),
  studentController.getStudents
);

// GET student by ID ✅ FIXED
router.get(
  "/:id",
  auth,
  roles(...allowedRoles),
  studentController.getStudentById
);

// UPDATE student
router.put(
  "/:id",
  auth,
  roles(...allowedRoles),
  upload.single("student_photo"),
  studentController.updateStudent
);

// DELETE (soft delete)
router.delete(
  "/:id",
  auth,
  roles(...allowedRoles),
  studentController.deleteStudent
);

module.exports = router;
