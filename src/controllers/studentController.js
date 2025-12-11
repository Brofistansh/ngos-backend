const Student = require("../models/sequelize/Student");
const NGO = require("../models/sequelize/NGO");
const Center = require("../models/sequelize/Center");

// Cloudinary
const cloudinary = require("cloudinary").v2;

exports.createStudent = async (req, res) => {
  try {
    const { ngo_id, center_id } = req.body;

    // Validate NGO
    const ngo = await NGO.findByPk(ngo_id);
    if (!ngo) return res.status(404).json({ message: "NGO not found" });

    // Validate Center
    const center = await Center.findByPk(center_id);
    if (!center) return res.status(404).json({ message: "Center not found" });

    let student_photo = null;

    // Upload photo if file provided
    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "students"
      });
      student_photo = upload.secure_url;
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
    res.status(500).json({ message: "Error creating student" });
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

exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    let student_photo = student.student_photo;

    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "students"
      });
      student_photo = upload.secure_url;
    }

    await student.update({
      ...req.body,
      student_photo
    });

    res.json({ message: "Student updated", data: student });

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
