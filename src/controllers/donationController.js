// src/controllers/donationController.js
const Donation = require('../models/sequelize/Donation');
const Donor = require('../models/sequelize/Donor');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

/**
 * Simple receipt generator:
 * pattern: NGO-{YYYY}-{MM}-{NNNN}
 * We'll generate a short unique suffix using uuid.
 */
function generateReceiptNumber(ngo_id) {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const suffix = uuidv4().split('-')[0]; // short unique
  return `NGO-${ngo_id ? ngo_id.slice(0,6) : 'GEN'}-${y}${m}-${suffix}`.toUpperCase();
}

exports.createDonation = async (req, res) => {
  try {
    const user = req.user;
    const {
      donor_id, ngo_id, center_id,
      amount, currency, date, method, purpose, status
    } = req.body;

    if (!ngo_id) return res.status(400).json({ message: 'ngo_id required' });
    if (!amount) return res.status(400).json({ message: 'amount required' });

    // permission check: non-super users must belong to same NGO if they have ngo_id
    if (user.role !== 'super_admin') {
      if (user.ngo_id !== ngo_id) return res.status(403).json({ message: 'Cannot record donation for another NGO' });
    }

    // create donation
    const donation = await Donation.create({
      donor_id: donor_id || null,
      ngo_id,
      center_id: center_id || null,
      amount,
      currency: currency || 'INR',
      date: date || new Date().toISOString().split('T')[0],
      method: method || 'online',
      purpose: purpose || null,
      status: status || 'completed',
      recorded_by: user.id,
      receipt_number: generateReceiptNumber(ngo_id)
    });

    return res.status(201).json({ message: 'Donation recorded', data: donation });
  } catch (err) {
    console.error('createDonation error', err);
    return res.status(500).json({ message: 'Error recording donation' });
  }
};

exports.getDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const d = await Donation.findByPk(id);
    if (!d) return res.status(404).json({ message: 'Donation not found' });
    return res.json(d);
  } catch (err) {
    console.error('getDonation error', err);
    return res.status(500).json({ message: 'Error fetching donation' });
  }
};

exports.listDonations = async (req, res) => {
  try {
    const { ngo_id, center_id, donor_id, from, to, limit = 50, offset = 0 } = req.query;
    const where = {};
    if (ngo_id) where.ngo_id = ngo_id;
    if (center_id) where.center_id = center_id;
    if (donor_id) where.donor_id = donor_id;
    if (from && to) where.date = { [Op.between]: [from, to] };
    else if (from) where.date = { [Op.gte]: from };
    else if (to) where.date = { [Op.lte]: to };

    const list = await Donation.findAll({
      where,
      order: [['date','DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return res.json(list);
  } catch (err) {
    console.error('listDonations error', err);
    return res.status(500).json({ message: 'Error listing donations' });
  }
};

exports.updateDonation = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const d = await Donation.findByPk(id);
    if (!d) return res.status(404).json({ message: 'Donation not found' });

    // only super_admin or ngo_admin/ngo_manager (same ngo) can update
    if (user.role !== 'super_admin') {
      if (user.ngo_id !== d.ngo_id) return res.status(403).json({ message: 'Cannot update donation for another NGO' });
    }

    await d.update(req.body);
    return res.json({ message: 'Donation updated', data: d });
  } catch (err) {
    console.error('updateDonation error', err);
    return res.status(500).json({ message: 'Error updating donation' });
  }
};

exports.deleteDonation = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const d = await Donation.findByPk(id);
    if (!d) return res.status(404).json({ message: 'Donation not found' });

    if (user.role !== 'super_admin') {
      if (user.ngo_id !== d.ngo_id) return res.status(403).json({ message: 'Cannot delete donation for another NGO' });
    }

    await d.destroy();
    return res.json({ message: 'Donation deleted' });
  } catch (err) {
    console.error('deleteDonation error', err);
    return res.status(500).json({ message: 'Error deleting donation' });
  }
};
