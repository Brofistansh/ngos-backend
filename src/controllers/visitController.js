const Visit = require("../models/sequelize/Visit");
const Center = require("../models/sequelize/Center");

/**
 * CREATE VISIT
 */
exports.createVisit = async (req, res) => {
  try {
    const { center_id } = req.body;

    const center = await Center.findByPk(center_id);
    if (!center) {
      return res.status(404).json({ message: "Center not found" });
    }

    const visit = await Visit.create({
      ...req.body,

      uploaded_by: {
        user_id: req.user.id,
        name: req.user.name,
        role: req.user.role
      },

      ngo_id: req.user.ngo_id
    });

    res.status(201).json({
      message: "Visit created successfully",
      data: {
        ...visit.toJSON(),
        center: {
          id: center.id,
          name: center.name
        }
      }
    });

  } catch (err) {
    console.error("Create Visit Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET ALL VISITS
 * Filters: center_id, date
 */
exports.getVisits = async (req, res) => {
  try {
    const { center_id, date } = req.query;

    const where = {};
    if (center_id) where.center_id = center_id;
    if (date) where.visit_date = date;

    const visits = await Visit.findAll({
      where,
      include: [
        {
          model: Center,
          as: "visit_center",
          attributes: ["id", "name"]
        }
      ],
      order: [["visit_date", "DESC"]]
    });

    const data = visits.map(v => ({
      ...v.toJSON(),
      center: {
        id: v.visit_center.id,
        name: v.visit_center.name
      }
    }));

    res.json({ count: data.length, data });

  } catch (err) {
    console.error("Get Visits Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET VISIT BY ID
 */
exports.getVisitById = async (req, res) => {
  try {
    const visit = await Visit.findByPk(req.params.id, {
      include: [
        {
          model: Center,
          as: "visit_center",
          attributes: ["id", "name"]
        }
      ]
    });

    if (!visit) {
      return res.status(404).json({ message: "Visit not found" });
    }

    res.json({
      data: {
        ...visit.toJSON(),
        center: {
          id: visit.visit_center.id,
          name: visit.visit_center.name
        }
      }
    });

  } catch (err) {
    console.error("Get Visit By Id Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * UPDATE VISIT
 */
exports.updateVisit = async (req, res) => {
  try {
    const visit = await Visit.findByPk(req.params.id);
    if (!visit) {
      return res.status(404).json({ message: "Visit not found" });
    }

    await visit.update(req.body);

    res.json({
      message: "Visit updated successfully",
      data: visit
    });

  } catch (err) {
    console.error("Update Visit Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * DELETE VISIT
 */
exports.deleteVisit = async (req, res) => {
  try {
    const visit = await Visit.findByPk(req.params.id);
    if (!visit) {
      return res.status(404).json({ message: "Visit not found" });
    }

    await visit.destroy();

    res.json({ message: "Visit deleted successfully" });

  } catch (err) {
    console.error("Delete Visit Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
