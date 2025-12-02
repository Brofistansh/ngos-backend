// src/controllers/studentController.js
const Student = require('../models/sequelize/Student');
const Center = require('../models/sequelize/Center');
const NGO = require('../models/sequelize/NGO');

exports.createStudent = async (req, res) => {
  try {
    const creator = req.user;
    const { name, age, gender, center_id, ngo_id, assigned_teacher_id } = req.body;

    if (!name || !center_id || !ngo_id) return res.status(400).json({ message: 'name, center_id and ngo_id required' });

    // permission: non-super users must belong to same NGO (and center if center role)
    if (creator.role !== 'super_admin') {
      if (creator.ngo_id !== ngo_id) return res.status(403).json({ message: 'Cannot create student for different NGO' });
      if (creator.role === 'center_manager' || creator.role === 'teacher' || creator.role === 'volunteer') {
        if (creator.center_id !== center_id) return res.status(403).json({ message: 'Cannot create student for different center' });
      }
    }

    // ensure center exists and belongs to NGO
    const center = await Center.findByPk(center_id);
    if (!center) return res.status(404).json({ message: 'Center not found' });
    if (center.ngo_id !== ngo_id) return res.status(400).json({ message: 'center does not belong to NGO' });

    const student = await Student.create({
      name, age, gender, center_id, ngo_id, assigned_teacher_id
    });

    return res.status(201).json({ message: 'Student created', data: student });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error creating student' });
  }
};

exports.getStudentsByCenter = async (req, res) => {
  try {
    const { center_id } = req.params;
    const students = await Student.findAll({ where: { center_id } });
    return res.json(students);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching students' });
  }
};

exports.getStudentsByTeacher = async (req, res) => {
  try {
    const { teacher_id } = req.params;
    const students = await Student.findAll({ where: { assigned_teacher_id: teacher_id } });
    return res.json(students);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching students' });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const up = await Student.findByPk(id);
    if (!up) return res.status(404).json({ message: 'Student not found' });
    await up.update(req.body);
    return res.json({ message: 'Student updated', data: up });
  } catch (err) {
    return res.status(500).json({ message: 'Error updating student' });
  }
};

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
