// src/migrations/add-indexes.js
const sequelize = require('../db/postgres');

async function addIndexes() {
  try {
    console.log('🔨 Adding database indexes...');

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_donations_date ON donations(date);
      CREATE INDEX IF NOT EXISTS idx_donations_ngo_id ON donations(ngo_id);
      CREATE INDEX IF NOT EXISTS idx_donations_center_id ON donations(center_id);
      CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON donations(donor_id);
      CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
      CREATE INDEX IF NOT EXISTS idx_donations_ngo_date ON donations(ngo_id, date);
    `);

    console.log('🎉 All donation indexes added!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Error adding indexes:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  addIndexes();
}

module.exports = addIndexes;
