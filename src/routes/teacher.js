// src/routes/teacher.js
const express = require('express');
const router = express.Router();

const upload = require('../middlewares/uploadMiddleware').single('teacher_photo'); // form-data key: teacher_photo
const teacherController = require('../controllers/teacherController');
const auth = require('../middlewares/authMiddleware');
const roles = require('../middlewares/roleMiddleware');

// Who can create teacher? super_admin, ngo_admin, center_admin
router.post('/', auth, roles('super_admin','ngo_admin','center_admin'), (req, res, next) => {
  upload(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
}, teacherController.createTeacher);

// list
router.get('/', auth, roles('super_admin','ngo_admin','center_admin'), teacherController.listTeachers);

// get by id
router.get('/:id', auth, roles('super_admin','ngo_admin','center_admin','teacher'), teacherController.getTeacher);

// update (allow teacher to update their own if role teacher)
router.put('/:id', auth, roles('super_admin','ngo_admin','center_admin','teacher'), (req,res,next) => {
  upload(req,res,(err)=>{ if(err) return res.status(400).json({message:err.message}); next(); });
}, teacherController.updateTeacher);

// soft delete
router.delete('/:id', auth, roles('super_admin','ngo_admin','center_admin'), teacherController.deleteTeacher);

module.exports = router;
