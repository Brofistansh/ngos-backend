const { Op } = require("sequelize");
const StockHeader = require("../models/sequelize/StockHeader");
const StockEntry = require("../models/sequelize/StockEntry");
const Teacher = require("../models/sequelize/Teacher");

/**
 * ============================
 * CREATE STOCK (TEACHER ONLY)
 * ============================
 */
exports.createStock = async (req, res) => {
  try {
    if (req.user.role !== "teacher") {
      return res.status(403).json({ message: "Only teacher can create stock" });
    }

    const teacher = await Teacher.findOne({
      where: { user_id: req.user.id },
    });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const { entries } = req.body;
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ message: "entries required" });
    }

    const stock = await StockHeader.create({
      teacher_id: teacher.id,
      teacher_name: req.user.name,
      ngo_id: req.user.ngo_id,
      center_id: req.user.center_id,
    });

    const formattedEntries = entries.map(e => ({
      ...e,
      stock_id: stock.id,
    }));

    await StockEntry.bulkCreate(formattedEntries);

    return res.status(201).json({
      message: "Stock created successfully",
      stock_id: stock.id,
    });

  } catch (err) {
    console.error("Create Stock Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * ============================
 * GET STOCK (ALL ROLES)
 * ============================
 * Filters:
 * - center_id (required for manager/admin)
 * - date range
 */
exports.getStock = async (req, res) => {
  try {
    const { role, center_id } = req.user;
    const { from_date, to_date, centerId } = req.query;

    const where = {};

    if (role !== "teacher") {
      if (!centerId) {
        return res.status(400).json({ message: "center_id required" });
      }
      where.center_id = centerId;
    } else {
      where.center_id = center_id;
    }

    const entriesWhere = {};
    if (from_date && to_date) {
      entriesWhere.date = { [Op.between]: [from_date, to_date] };
    }

    const data = await StockHeader.findAll({
      where,
      include: [
        {
          model: StockEntry,
          as: "entries",
          where: entriesWhere,
          required: false,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      count: data.length,
      data,
    });

  } catch (err) {
    console.error("Get Stock Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
