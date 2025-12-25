const fs = require("fs");
const cloudinary = require("cloudinary").v2;

const Student = require("../models/sequelize/Student");
const NGO = require("../models/sequelize/NGO");
const Center = require("../models/sequelize/Center");
const { generateRollNo } = require("../utils/generateRollNo");

exports.createStudent = async (req, res) => {
  try {
    const { ngo_id, center_id, zone_code } = req.body;

    const ngo = await NGO.findByPk(ngo_id);
    if (!ngo) return res.status(404).json({ message: "NGO not found" });

    const center = await Center.findByPk(center_id);
    if (!center) return res.status(404).json({ message: "Center not found" });

    const enrollmentYear = new Date().getFullYear();

    const roll_no = await generateRollNo({
      enrollmentYear,
      zoneCode: zone_code,
      centerCode: center.name
    });

    let student_photo = null;

    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "ngos/students"
      });
      student_photo = upload.secure_url;
      fs.unlinkSync(req.file.path);
    } else if (req.body.student_photo?.trim()) {
      student_photo = req.body.student_photo.trim();
    }

    const student = await Student.create({
      ...req.body,
      roll_no,
      student_photo
    });

    res.status(201).json({
      message: "Student created successfully",
      data: student
    });

  } catch (err) {
    console.error("Error creating student:", err);
    res.status(500).json({ message: "Error creating student" });
  }
};

exports.getStudents = async (req, res) => {
  try {
    const where = {};
    if (req.query.ngo_id) where.ngo_id = req.query.ngo_id;
    if (req.query.center_id) where.center_id = req.query.center_id;

    const students = await Student.findAll({ where });
    res.json({ count: students.length, data: students });
  } catch {
    res.status(500).json({ message: "Error fetching students" });
  }
};

// 🔑 NOW USE roll_no
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.roll_no);
    if (!student) return res.status(404).json({ message: "Student not found" });

    res.json({ data: student });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.roll_no);
    if (!student) return res.status(404).json({ message: "Student not found" });

    let student_photo = student.student_photo;

    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "ngos/students"
      });
      student_photo = upload.secure_url;
      fs.unlinkSync(req.file.path);
    } else if (req.body.student_photo?.trim()) {
      student_photo = req.body.student_photo.trim();
    }

    await student.update({ ...req.body, student_photo });

    res.json({ message: "Student updated", data: student });
  } catch {
    res.status(500).json({ message: "Error updating student" });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.roll_no);
    if (!student) return res.status(404).json({ message: "Student not found" });

    await student.update({ student_status: "inactive" });
    res.json({ message: "Student deactivated" });
  } catch {
    res.status(500).json({ message: "Error deleting student" });
  }
};
