const { Sequelize } = require('sequelize');
const config = require('../../config');

const sequelize = new Sequelize(
  config.DB_NAME || 'ngos_dev',
  config.DB_USER || 'postgres',
  config.DB_PASS || 'postgres',
  {
    host: config.DB_HOST || 'localhost',
    port: config.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  }
);

module.exports = sequelize;
