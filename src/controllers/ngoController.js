const NGO = require('../models/sequelize/NGO');

exports.createNGO = async (req, res) => {
  try {
    const { name, registration_number, contact_email } = req.body;

    const ngo = await NGO.create({
      name,
      registration_number,
      contact_email
    });

    return res.status(201).json({
      message: "NGO created successfully",
      data: ngo
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error creating NGO" });
  }
};

exports.getNGOs = async (req, res) => {
  try {
    const ngos = await NGO.findAll();
    return res.json(ngos);
  } catch (err) {
    res.status(500).json({ message: "Error fetching NGOs" });
  }
};
