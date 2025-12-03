// src/controllers/studentController.js
const Student = require('../models/sequelize/Student');
const Center = require('../models/sequelize/Center');

exports.createStudent = async (req, res) => {
  try {
    const creator = req.user;
    const { name, age, gender, center_id, assigned_teacher_id, date_of_birth } = req.body;

    if (!name || !center_id)
      return res.status(400).json({ message: 'name and center_id required' });

    // ⭐ Fetch Center to auto-get NGO ID
    const center = await Center.findByPk(center_id);
    if (!center)
      return res.status(404).json({ message: 'Center not found' });

    const ngo_id = center.ngo_id;   // ⭐ THE MAGIC — auto-set NGO ID internally

    // 🔐 PERMISSION CHECKS (same logic, but now using center.ngo_id)
    if (creator.role !== 'super_admin') {
      if (creator.ngo_id !== ngo_id)
        return res.status(403).json({ message: 'Cannot create student for different NGO' });

      if (['center_manager', 'teacher', 'volunteer'].includes(creator.role)) {
        if (creator.center_id !== center_id)
          return res.status(403).json({ message: 'Cannot create student for different center' });
      }
    }

    // Create the student
    const student = await Student.create({
      name,
      age,
      gender,
      center_id,
      ngo_id,   // ⭐ Always correct because we fetched it
      assigned_teacher_id,
      date_of_birth
    });

    return res.status(201).json({
      message: 'Student created successfully',
      data: student
    });

  } catch (err) {
    console.error("createStudent error:", err);
    return res.status(500).json({ message: 'Error creating student' });
  }
};



// ---------------- GET STUDENTS BY CENTER ----------------
exports.getStudentsByCenter = async (req, res) => {
  try {
    const { center_id } = req.params;
    const students = await Student.findAll({ where: { center_id } });
    return res.json(students);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching students' });
  }
};

// ---------------- GET STUDENTS BY TEACHER ----------------
exports.getStudentsByTeacher = async (req, res) => {
  try {
    const { teacher_id } = req.params;
    const students = await Student.findAll({ where: { assigned_teacher_id: teacher_id } });
    return res.json(students);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching students' });
  }
};

// ---------------- UPDATE STUDENT ----------------
exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const up = await Student.findByPk(id);

    if (!up) return res.status(404).json({ message: 'Student not found' });

    await up.update(req.body);

    return res.json({
      message: 'Student updated',
      data: up
    });
  } catch (err) {
    return res.status(500).json({ message: 'Error updating student' });
  }
};

// ---------------- DELETE STUDENT ----------------
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const s = await Student.findByPk(id);

    if (!s) return res.status(404).json({ message: 'Student not found' });

    await s.destroy();

    return res.json({ message: 'Student deleted' });

  } catch (err) {
    return res.status(500).json({ message: 'Error deleting student' });
  }
};
