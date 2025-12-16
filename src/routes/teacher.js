// src/routes/teacher.js

const express = require('express');
const router = express.Router();

const upload = require('../middlewares/uploadMiddleware').single('teacher_photo');

const teacherController = require('../controllers/teacherController');
const auth = require('../middlewares/authMiddleware');
const roles = require('../middlewares/roleMiddleware');

// CREATE teacher
router.post(
  '/',
  auth,
  roles('super_admin', 'ngo_admin', 'center_admin'),
  upload,
  teacherController.createTeacher
);

// GET all teachers
router.get(
  '/',
  auth,
  roles('super_admin', 'ngo_admin', 'center_admin'),
  teacherController.listTeachers
);

// GET teacher by ID
router.get(
  '/:id',
  auth,
  roles('super_admin', 'ngo_admin', 'center_admin', 'teacher'),
  teacherController.getTeacher
);

// UPDATE teacher
router.put(
  '/:id',
  auth,
  roles('super_admin', 'ngo_admin', 'center_admin', 'teacher'),
  upload,
  teacherController.updateTeacher
);

// DELETE teacher
router.delete(
  '/:id',
  auth,
  roles('super_admin', 'ngo_admin', 'center_admin'),
  teacherController.deleteTeacher
);

module.exports = router;
