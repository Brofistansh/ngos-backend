// src/controllers/donorController.js
const Donor = require('../models/sequelize/Donor');
const { Op } = require('sequelize');

exports.createDonor = async (req, res) => {
  try {
    const { name, email, phone, address, notes } = req.body;
    if (!name) return res.status(400).json({ message: 'name required' });

    const donor = await Donor.create({ name, email, phone, address, notes });
    return res.status(201).json({ message: 'Donor created', data: donor });
  } catch (err) {
    console.error('createDonor error', err);
    return res.status(500).json({ message: 'Error creating donor' });
  }
};

exports.getDonor = async (req, res) => {
  try {
    const { id } = req.params;
    const d = await Donor.findByPk(id);
    if (!d) return res.status(404).json({ message: 'Donor not found' });
    return res.json(d);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching donor' });
  }
};

exports.listDonors = async (req, res) => {
  try {
    const { q, limit = 50, offset = 0 } = req.query;
    const where = q ? { [Op.or]: [
      { name: { [Op.iLike]: `%${q}%` } },
      { email: { [Op.iLike]: `%${q}%` } },
      { phone: { [Op.iLike]: `%${q}%` } }
    ]} : {};

    const donors = await Donor.findAll({ where, limit: parseInt(limit), offset: parseInt(offset) });
    return res.json(donors);
  } catch (err) {
    console.error('listDonors error', err);
    return res.status(500).json({ message: 'Error listing donors' });
  }
};

exports.updateDonor = async (req, res) => {
  try {
    const { id } = req.params;
    const d = await Donor.findByPk(id);
    if (!d) return res.status(404).json({ message: 'Donor not found' });
    await d.update(req.body);
    return res.json({ message: 'Donor updated', data: d });
  } catch (err) {
    console.error('updateDonor error', err);
    return res.status(500).json({ message: 'Error updating donor' });
  }
};

exports.deleteDonor = async (req, res) => {
  try {
    const { id } = req.params;
    const d = await Donor.findByPk(id);
    if (!d) return res.status(404).json({ message: 'Donor not found' });
    await d.destroy();
    return res.json({ message: 'Donor deleted' });
  } catch (err) {
    console.error('deleteDonor error', err);
    return res.status(500).json({ message: 'Error deleting donor' });
  }
};
