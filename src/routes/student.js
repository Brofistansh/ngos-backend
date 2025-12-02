// src/routes/student.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');
const ctrl = require('../controllers/studentController');

// create student - permitted roles: center_manager, teacher, ngo_manager, ngo_admin, super_admin
router.post('/', auth, requireRole('center_manager','teacher','ngo_manager','ngo_admin','super_admin'), ctrl.createStudent);

// list students by center
router.get('/center/:center_id', auth, requireRole('center_manager','ngo_manager','ngo_admin','super_admin'), ctrl.getStudentsByCenter);

// list students by teacher
router.get('/teacher/:teacher_id', auth, requireRole('teacher','center_manager','ngo_manager','ngo_admin','super_admin'), ctrl.getStudentsByTeacher);

// update student
router.put('/:id', auth, requireRole('center_manager','ngo_manager','ngo_admin','super_admin'), ctrl.updateStudent);

// delete student
router.delete('/:id', auth, requireRole('center_manager','ngo_manager','ngo_admin','super_admin'), ctrl.deleteStudent);

module.exports = router;
