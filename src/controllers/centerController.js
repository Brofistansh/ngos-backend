const Center = require('../models/sequelize/Center');
const NGO = require('../models/sequelize/NGO');

exports.createCenter = async (req, res) => {
  try {
    const { ngo_id } = req.params;  // NGO ID in URL
    const { name, contact_phone, timezone, zone } = req.body; // ⬅️ zone added here

    const ngo = await NGO.findByPk(ngo_id);
    if (!ngo) {
      return res.status(404).json({ message: "NGO not found" });
    }

    const center = await Center.create({
      ngo_id,
      name,
      contact_phone,
      timezone,
      zone // ⬅️ zone stored in DB
    });

    return res.status(201).json({
      message: "Center created successfully",
      data: center
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error creating center" });
  }
};


exports.getCentersByNGO = async (req, res) => {
  try {
    const { ngo_id } = req.params;
    const { zone } = req.query; // ⬅️ zone filter from query

    let where = { ngo_id }; // base filter

    if (zone) {
      where.zone = zone; // ⬅️ apply zone filter
    }

    const centers = await Center.findAll({ where });

    return res.json(centers);

  } catch (err) {
    res.status(500).json({ message: "Error fetching centers" });
  }
};
