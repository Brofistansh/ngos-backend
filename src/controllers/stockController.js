const { Op } = require("sequelize");
const StockHeader = require("../models/sequelize/StockHeader");
const StockEntry = require("../models/sequelize/StockEntry");
const Teacher = require("../models/sequelize/Teacher");
const User = require("../models/sequelize/User");

/**
 * ==================================================
 * CREATE STOCK (TEACHER ONLY)
 * ==================================================
 */
exports.createStock = async (req, res) => {
  try {
    const { entries } = req.body;

    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ message: "entries array is required" });
    }

    // 🔐 Find logged-in teacher with user
    const teacher = await Teacher.findOne({
      where: { user_id: req.user.id },
      include: [
        {
          model: User,
          as: "user", // ✅ MUST MATCH ASSOCIATION
          attributes: ["id", "name"],
        },
      ],
    });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // =============================
    // CREATE STOCK HEADER
    // =============================
    const stockHeader = await StockHeader.create({
      teacher_id: teacher.id,
      teacher_name: teacher.user.name, // ✅ FIXED
      center_id: req.user.center_id,
      ngo_id: req.user.ngo_id,
      created_by: req.user.id,
    });

    // =============================
    // CREATE STOCK ENTRIES
    // (snake_case + camelCase SAFE)
    // =============================
    const stockEntries = entries.map((e) => ({
      stock_header_id: stockHeader.id,
      date: e.date,
      particulars: e.particulars,

      bill_no: e.bill_no || e.billNo || null,

      receipt_qty: e.receipt_qty ?? e.receiptQty ?? 0,
      issue_qty: e.issue_qty ?? e.issueQty ?? 0,
      balance_qty: e.balance_qty ?? e.balanceQty ?? 0,

      remarks: e.remarks || null,
    }));

    await StockEntry.bulkCreate(stockEntries);

    return res.status(201).json({
      message: "Stock created successfully",
      data: {
        stock_id: stockHeader.id,
        teacher: {
          id: teacher.id,
          name: teacher.user.name,
        },
      },
    });

  } catch (err) {
    console.error("Create Stock Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * ==================================================
 * GET STOCK
 * ==================================================
 * Teacher → own center
 * Manager → by center_id
 * Super Admin → all
 */
exports.getStock = async (req, res) => {
  try {
    const { role, center_id } = req.user;
    const { centerId, from_date, to_date } = req.query;

    const where = {};

    if (role === "teacher") {
      where.center_id = center_id;
    }

    if (role === "manager") {
      if (!centerId) {
        return res.status(400).json({
          message: "centerId is required for manager",
        });
      }
      where.center_id = centerId;
    }

    if (from_date && to_date) {
      where.createdAt = {
        [Op.between]: [from_date, to_date],
      };
    }

    const data = await StockHeader.findAll({
      where,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: StockEntry,
          as: "entries",
        },
      ],
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
