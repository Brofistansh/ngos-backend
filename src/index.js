const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('../config');

const app = express();

// ------------------------------
// GLOBAL MIDDLEWARES
// ------------------------------
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// ------------------------------
// PUBLIC ROUTES (NO API KEY REQUIRED)
// ------------------------------
app.get('/', (req, res) => {
  res.json({ status: "OK", message: "NGO Backend is Running 🔥" });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// TEMP HASH GENERATOR ROUTE (Public)
app.get('/debug/hash', async (req, res) => {
  const bcrypt = require('bcryptjs');
  const hash = await bcrypt.hash("superpass123", 10);
  res.json({ hash });
});

// Auth routes MUST be OPEN
app.use('/auth', require('./routes/auth'));


// ------------------------------
// API KEY MIDDLEWARE (after auth)
// ------------------------------
const apiKeyMiddleware = require('./middlewares/apiKeyMiddleware');
app.use(apiKeyMiddleware);   // ⭐ This should now NOT block /debug/hash and /auth


// ------------------------------
// PROTECTED ROUTES
// ------------------------------
app.use('/ngos', require('./routes/ngo'));
app.use('/ngos', require('./routes/center'));    // <- mounted under /ngos so center routes become /ngos/:ngo_id/centers
app.use('/users', require('./routes/user'));
app.use('/attendance', require('./routes/attendance'));
app.use('/students', require('./routes/student'));
app.use('/student-attendance', require('./routes/studentAttendance'));
app.use('/reports', require('./routes/report'));
app.use('/donors', require('./routes/donor'));
app.use('/donations', require('./routes/donation'));
app.use('/reports/donations', require('./routes/donationReports'));

// Swagger
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// DB
const sequelize = require('./db/postgres');
sequelize.authenticate()
  .then(() => sequelize.sync({ alter: true }))
  .then(() => console.log("DB ready"))
  .catch(err => console.error(err));


// START SERVER
app.listen(config.PORT, () => {
  console.log(`Server started on port ${config.PORT}`);
});

module.exports = app;
