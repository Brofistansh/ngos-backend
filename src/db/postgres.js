const { Sequelize } = require("sequelize");
const config = require("../../config");

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    })
  : new Sequelize(
      config.DB_NAME,
      config.DB_USER,
      config.DB_PASS,
      {
        host: config.DB_HOST,
        port: config.DB_PORT,
        dialect: "postgres",
        logging: false,
      }
    );

module.exports = sequelize;



// const { Sequelize } = require('sequelize');
// const config = require('../../config');

// const sequelize = new Sequelize(
//   config.DB_NAME,
//   config.DB_USER,
//   config.DB_PASS,
//   {
//     host: config.DB_HOST,
//     port: config.DB_PORT,
//     dialect: 'postgres',
//     logging: false,
//     dialectOptions: {
//       ssl: {
//         require: true,
//         rejectUnauthorized: false,
//       },
//     },
//   }
// );

// module.exports = sequelize;
