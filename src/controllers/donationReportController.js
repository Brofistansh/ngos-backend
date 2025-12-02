// src/controllers/donationReportController.js
const { Op, fn, col, literal } = require('sequelize');
const Donation = require('../models/sequelize/Donation');
const Donor = require('../models/sequelize/Donor');
const Center = require('../models/sequelize/Center');

/* reuse helpers similar to attendance reports */
function yyyyMmToRange(year, month) {
  const y = parseInt(year, 10);
  const m = parseInt(month, 10);
  const start = new Date(Date.UTC(y, m - 1, 1));
  const next = new Date(Date.UTC(m === 12 ? y + 1 : y, m === 12 ? 0 : m, 1));
  const end = new Date(next.getTime() - 1);
  const pad = n => (n < 10 ? '0' + n : '' + n);
  const startStr = `${start.getUTCFullYear()}-${pad(start.getUTCMonth() + 1)}-${pad(start.getUTCDate())}`;
  const endStr = `${end.getUTCFullYear()}-${pad(end.getUTCMonth() + 1)}-${pad(end.getUTCDate())}`;
  return { startStr, endStr, startDate: start, endDate: end };
}

function listDatesInRange(startDate, endDate) {
  const list = [];
  const cur = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()));
  const end = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate()));
  while (cur <= end) {
    const y = cur.getUTCFullYear(), m = cur.getUTCMonth() + 1, d = cur.getUTCDate();
    const pad = n => (n < 10 ? '0' + n : '' + n);
    list.push(`${y}-${pad(m)}-${pad(d)}`);
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return list;
}

/* ---------- helpers to aggregate donations ---------- */

async function dailyDonationMap(where) {
  // returns { date -> { amount: n, count: n } }
  const rows = await Donation.findAll({
    where,
    attributes: ['date', [fn('sum', col('amount')), 'total_amount'], [fn('count', col('id')), 'count']],
    group: ['date'],
    raw: true
  });

  const map = {};
  rows.forEach(r => {
    map[r.date] = { amount: parseFloat(r.total_amount || 0), count: parseInt(r.count || 0, 10) };
  });
  return map;
}

async function methodStats(where) {
  // returns { method: { amount, count } }
  const rows = await Donation.findAll({
    where,
    attributes: ['method', [fn('sum', col('amount')), 'total_amount'], [fn('count', col('id')), 'count']],
    group: ['method'],
    raw: true
  });
  const out = {};
  rows.forEach(r => {
    out[r.method] = { amount: parseFloat(r.total_amount || 0), count: parseInt(r.count || 0, 10) };
  });
  return out;
}

async function centerTotals(where) {
  // returns array [{ center_id, total_amount, count }]
  const rows = await Donation.findAll({
    where,
    attributes: ['center_id', [fn('sum', col('amount')), 'total_amount'], [fn('count', col('id')), 'count']],
    group: ['center_id'],
    raw: true
  });
  return rows.map(r => ({ center_id: r.center_id, total_amount: parseFloat(r.total_amount || 0), count: parseInt(r.count || 0, 10) }));
}

async function topDonors(where, limit = 5) {
  // returns [{ donor_id, total_amount, count }]
  const rows = await Donation.findAll({
    where,
    attributes: ['donor_id', [fn('sum', col('amount')), 'total_amount'], [fn('count', col('id')), 'count']],
    group: ['donor_id'],
    order: [[fn('sum', col('amount')), 'DESC']],
    limit,
    raw: true
  });
  // fetch donor details for donor_ids
  const ids = rows.map(r => r.donor_id).filter(Boolean);
  const donors = ids.length ? await Donor.findAll({ where: { id: ids }, raw: true }) : [];
  const donorMap = donors.reduce((acc, d) => { acc[d.id] = d; return acc; }, {});
  return rows.map(r => ({
    donor_id: r.donor_id,
    donor: r.donor_id ? (donorMap[r.donor_id] || null) : null,
    total_amount: parseFloat(r.total_amount || 0),
    count: parseInt(r.count || 0, 10)
  }));
}

/* ---------- Monthly Reports ---------- */

/**
 * GET /reports/donations/ngo/:ngo_id/monthly?year=YYYY&month=MM
 */
exports.ngoMonthly = async (req, res) => {
  try {
    const { ngo_id } = req.params;
    const year = req.query.year || new Date().getUTCFullYear();
    const month = req.query.month || (new Date().getUTCMonth() + 1);
    const { startStr, endStr, startDate, endDate } = yyyyMmToRange(year, month);

    const where = { ngo_id, date: { [Op.between]: [startStr, endStr] } };

    // daily breakdown
    const map = await dailyDonationMap(where);
    const dates = listDatesInRange(startDate, endDate);
    const daily_breakdown = dates.map(d => {
      const entry = map[d] || { amount: 0, count: 0 };
      return { date: d, amount: entry.amount, donations: entry.count };
    });

    const total_amount = daily_breakdown.reduce((acc, cur) => acc + cur.amount, 0);
    const total_count = daily_breakdown.reduce((acc, cur) => acc + cur.donations, 0);
    const avg_donation = total_count ? (total_amount / total_count) : 0;

    const top = await topDonors(where, 5);
    const methods = await methodStats(where);
    const centers = await centerTotals(where);

    return res.json({
      ngo_id,
      period: `${year}-${String(month).padStart(2,'0')}`,
      total_amount: parseFloat(total_amount.toFixed(2)),
      total_donations: total_count,
      average_donation: parseFloat(avg_donation.toFixed(2)),
      daily_breakdown,
      top_donors: top,
      method_stats: methods,
      center_totals: centers
    });

  } catch (err) {
    console.error('ngoMonthlyDonation error', err);
    return res.status(500).json({ message: 'Error generating NGO monthly donation report' });
  }
};

/**
 * GET /reports/donations/center/:center_id/monthly?year=YYYY&month=MM
 */
exports.centerMonthly = async (req, res) => {
  try {
    const { center_id } = req.params;
    const year = req.query.year || new Date().getUTCFullYear();
    const month = req.query.month || (new Date().getUTCMonth() + 1);
    const { startStr, endStr, startDate, endDate } = yyyyMmToRange(year, month);

    const where = { center_id, date: { [Op.between]: [startStr, endStr] } };

    const map = await dailyDonationMap(where);
    const dates = listDatesInRange(startDate, endDate);
    const daily_breakdown = dates.map(d => {
      const entry = map[d] || { amount: 0, count: 0 };
      return { date: d, amount: entry.amount, donations: entry.count };
    });

    const total_amount = daily_breakdown.reduce((acc, cur) => acc + cur.amount, 0);
    const total_count = daily_breakdown.reduce((acc, cur) => acc + cur.donations, 0);
    const avg_donation = total_count ? (total_amount / total_count) : 0;

    const top = await topDonors(where, 5);
    const methods = await methodStats(where);

    return res.json({
      center_id,
      period: `${year}-${String(month).padStart(2,'0')}`,
      total_amount: parseFloat(total_amount.toFixed(2)),
      total_donations: total_count,
      average_donation: parseFloat(avg_donation.toFixed(2)),
      daily_breakdown,
      top_donors: top,
      method_stats: methods
    });

  } catch (err) {
    console.error('centerMonthlyDonation error', err);
    return res.status(500).json({ message: 'Error generating center monthly donation report' });
  }
};

/**
 * GET /reports/donations/donor/:donor_id/monthly?year=YYYY&month=MM
 */
exports.donorMonthly = async (req, res) => {
  try {
    const { donor_id } = req.params;
    const year = req.query.year || new Date().getUTCFullYear();
    const month = req.query.month || (new Date().getUTCMonth() + 1);
    const { startStr, endStr, startDate, endDate } = yyyyMmToRange(year, month);

    const where = { donor_id, date: { [Op.between]: [startStr, endStr] } };

    const map = await dailyDonationMap(where);
    const dates = listDatesInRange(startDate, endDate);
    const daily_breakdown = dates.map(d => {
      const entry = map[d] || { amount: 0, count: 0 };
      return { date: d, amount: entry.amount, donations: entry.count };
    });

    const total_amount = daily_breakdown.reduce((acc, cur) => acc + cur.amount, 0);
    const total_count = daily_breakdown.reduce((acc, cur) => acc + cur.donations, 0);
    const avg_donation = total_count ? (total_amount / total_count) : 0;

    const methods = await methodStats(where);

    return res.json({
      donor_id,
      period: `${year}-${String(month).padStart(2,'0')}`,
      total_amount: parseFloat(total_amount.toFixed(2)),
      total_donations: total_count,
      average_donation: parseFloat(avg_donation.toFixed(2)),
      daily_breakdown,
      method_stats: methods
    });

  } catch (err) {
    console.error('donorMonthly error', err);
    return res.status(500).json({ message: 'Error generating donor monthly donation report' });
  }
};

/* ---------- Yearly reports (aggregate monthly) ---------- */

async function monthlyAggregates(where, year) {
  // returns array months [{ month: 'YYYY-01', amount, donations }]
  const start = `${year}-01-01`;
  const end = `${year}-12-31`;
  const rows = await Donation.findAll({
    where: { ...where, date: { [Op.between]: [start, end] } },
    attributes: [
      [fn('date_trunc', 'month', col('date')), 'month'],
      [fn('sum', col('amount')), 'total_amount'],
      [fn('count', col('id')), 'count']
    ],
    group: [literal('month')],
    order: [[literal('month'), 'ASC']],
    raw: true
  });

  // rows have month like 2025-01-01T00:00:00.000Z - convert
  return rows.map(r => {
    const m = new Date(r.month);
    const mm = `${m.getUTCFullYear()}-${String(m.getUTCMonth() + 1).padStart(2, '0')}`;
    return { month: mm, amount: parseFloat(r.total_amount || 0), donations: parseInt(r.count || 0, 10) };
  });
}

exports.ngoYearly = async (req, res) => {
  try {
    const { ngo_id } = req.params;
    const year = req.query.year || new Date().getUTCFullYear();

    const monthly = await monthlyAggregates({ ngo_id }, year);
    const total_amount = monthly.reduce((acc, cur) => acc + cur.amount, 0);
    const total_donations = monthly.reduce((acc, cur) => acc + cur.donations, 0);
    const average = total_donations ? (total_amount / total_donations) : 0;

    return res.json({
      ngo_id,
      year: parseInt(year, 10),
      total_amount: parseFloat(total_amount.toFixed(2)),
      total_donations,
      average_donation: parseFloat(average.toFixed(2)),
      months: monthly
    });
  } catch (err) {
    console.error('ngoYearly error', err);
    return res.status(500).json({ message: 'Error generating NGO yearly donation report' });
  }
};

exports.centerYearly = async (req, res) => {
  try {
    const { center_id } = req.params;
    const year = req.query.year || new Date().getUTCFullYear();

    const monthly = await monthlyAggregates({ center_id }, year);
    const total_amount = monthly.reduce((acc, cur) => acc + cur.amount, 0);
    const total_donations = monthly.reduce((acc, cur) => acc + cur.donations, 0);
    const average = total_donations ? (total_amount / total_donations) : 0;

    return res.json({
      center_id,
      year: parseInt(year, 10),
      total_amount: parseFloat(total_amount.toFixed(2)),
      total_donations,
      average_donation: parseFloat(average.toFixed(2)),
      months: monthly
    });
  } catch (err) {
    console.error('centerYearly error', err);
    return res.status(500).json({ message: 'Error generating center yearly donation report' });
  }
};

exports.donorYearly = async (req, res) => {
  try {
    const { donor_id } = req.params;
    const year = req.query.year || new Date().getUTCFullYear();

    const monthly = await monthlyAggregates({ donor_id }, year);
    const total_amount = monthly.reduce((acc, cur) => acc + cur.amount, 0);
    const total_donations = monthly.reduce((acc, cur) => acc + cur.donations, 0);
    const average = total_donations ? (total_amount / total_donations) : 0;

    return res.json({
      donor_id,
      year: parseInt(year, 10),
      total_amount: parseFloat(total_amount.toFixed(2)),
      total_donations,
      average_donation: parseFloat(average.toFixed(2)),
      months: monthly
    });
  } catch (err) {
    console.error('donorYearly error', err);
    return res.status(500).json({ message: 'Error generating donor yearly donation report' });
  }
};
