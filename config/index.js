// require('dotenv').config();

// module.exports = {
//   PORT: process.env.PORT || 4000,
//   NODE_ENV: process.env.NODE_ENV || 'development',
//   JWT_SECRET: process.env.JWT_SECRET || 'defaultsecret',

//   // Postgres DB
//   DB_HOST: process.env.DB_HOST,
//   DB_PORT: process.env.DB_PORT,
//   DB_USER: process.env.DB_USER,
//   DB_PASS: process.env.DB_PASS,
//   DB_NAME: process.env.DB_NAME
// };
require('dotenv').config();

// Validate environment for production
function validateConfig() {
  const required = ['JWT_SECRET', 'DB_HOST', 'DB_USER', 'DB_PASS', 'DB_NAME'];

  if (process.env.NODE_ENV === 'production') {
    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
      console.error('❌ Missing env variables:', missing.join(', '));
      process.exit(1);
    }
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      console.error('❌ Weak JWT_SECRET — must be 32+ characters!');
      process.exit(1);
    }
  }
}

validateConfig();

module.exports = {
  PORT: process.env.PORT || 4000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET,

  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT || 5432,
  DB_USER: process.env.DB_USER,
  DB_PASS: process.env.DB_PASS,
  DB_NAME: process.env.DB_NAME,

  API_KEY: process.env.API_KEY,

  ACCESS_TOKEN_EXPIRES: parseInt(process.env.ACCESS_TOKEN_EXPIRES || '1800', 10),
  REFRESH_TOKEN_EXPIRES_DAYS: parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || '7', 10)
};
