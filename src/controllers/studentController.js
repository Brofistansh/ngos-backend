// src/controllers/studentController.js
const fs = require('fs');
const cloudinary = require("cloudinary").v2;
const Student = require("../models/sequelize/Student");
const NGO = require("../models/sequelize/NGO");
const Center = require("../models/sequelize/Center");

exports.createStudent = async (req, res) => {
  try {
    const { ngo_id, center_id } = req.body;

    // Validate NGO & Center
    const ngo = await NGO.findByPk(ngo_id);
    if (!ngo) return res.status(404).json({ message: "NGO not found" });

    const center = await Center.findByPk(center_id);
    if (!center) return res.status(404).json({ message: "Center not found" });

    let student_photo = null;

    // Handle photo: direct upload OR pre-uploaded URL from Flutter
    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "ngos/students"
      });
      student_photo = upload.secure_url;
      fs.unlinkSync(req.file.path); // Clean up
    } else if (req.body.student_photo && req.body.student_photo.trim() !== "") {
      student_photo = req.body.student_photo.trim(); // ← Accept URL from Flutter
    }

    const student = await Student.create({
      ...req.body,
      student_photo
    });

    res.status(201).json({
      message: "Student created successfully",
      data: student
    });
  } catch (err) {
    console.error("Error creating student:", err);
    res.status(500).json({ message: "Error creating student", error: err.message });
  }
};

exports.getStudents = async (req, res) => {
  try {
    const { ngo_id, center_id } = req.query;
    const where = {};
    if (ngo_id) where.ngo_id = ngo_id;
    if (center_id) where.center_id = center_id;

    const students = await Student.findAll({ where });
    res.json({ count: students.length, data: students });
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ message: "Error fetching students" });
  }
};

// ← THIS WAS MISSING! Add this route
exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findByPk(id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    res.json({
      success: true,
      data: student
    });
  } catch (err) {
    console.error("Error fetching student:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    let student_photo = student.student_photo;

    // Handle photo: direct file OR pre-uploaded URL
    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "ngos/students"
      });
      student_photo = upload.secure_url;
      fs.unlinkSync(req.file.path);
    } else if (req.body.student_photo && req.body.student_photo.trim() !== "") {
      student_photo = req.body.student_photo.trim(); // ← Critical fix
    }

    await student.update({
      ...req.body,
      student_photo
    });

    res.json({
      message: "Student updated",
      data: student
    });
  } catch (err) {
    console.error("Error updating student:", err);
    res.status(500).json({ message: "Error updating student" });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    await student.update({ student_status: "inactive" });
    res.json({ message: "Student deactivated" });
  } catch (err) {
    console.error("Error deleting student:", err);
    res.status(500).json({ message: "Error deleting student" });
  }
};