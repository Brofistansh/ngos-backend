const DailyCenterReport = require("../models/sequelize/DailyCenterReport");
const Center = require("../models/sequelize/Center");

/**
 * CREATE DAILY CENTER REPORT
 * posted_by is AUTO from logged-in user
 */
exports.createDailyCenterReport = async (req, res) => {
  try {
    const { center_id } = req.body;

    const center = await Center.findByPk(center_id);
    if (!center) {
      return res.status(404).json({ message: "Center not found" });
    }

    const report = await DailyCenterReport.create({
      ...req.body,

      // 🔥 AUTO SET (NOT FROM BODY)
      posted_by: {
        user_id: req.user.id,
        name: req.user.name,
        role: req.user.role
      },

      ngo_id: req.user.ngo_id
    });

    res.status(201).json({
      message: "Daily center report created",
      data: {
        ...report.toJSON(),
        center: {
          id: center.id,
          name: center.name
        }
      }
    });

  } catch (err) {
    console.error("Create Daily Center Report Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET DAILY CENTER REPORTS (FILTER: center_id, date)
 */
exports.getDailyCenterReports = async (req, res) => {
  try {
    const { center_id, date } = req.query;

    const where = {};
    if (center_id) where.center_id = center_id;
    if (date) where.date = date;

    const reports = await DailyCenterReport.findAll({
      where,
      include: [
        {
          model: Center,
          as: "report_center",
          attributes: ["id", "name"]
        }
      ],
      order: [["date", "DESC"]]
    });

    const response = reports.map(r => ({
      ...r.toJSON(),
      center: {
        id: r.report_center.id,
        name: r.report_center.name
      }
    }));

    res.json({
      count: response.length,
      data: response
    });

  } catch (err) {
    console.error("Get Daily Center Reports Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
