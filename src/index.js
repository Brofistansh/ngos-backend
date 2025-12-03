// src/index.js

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('../config');

const app = express();

// ------------------------------
// GLOBAL MIDDLEWARES (must come FIRST)
// ------------------------------
app.use(express.json());     // ⭐ MUST BE FIRST
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

// Auth routes MUST be open so login can work
app.use('/auth', require('./routes/auth'));


// ------------------------------
// API KEY MIDDLEWARE (APPLIES AFTER AUTH)
// ------------------------------
const apiKeyMiddleware = require('./middlewares/apiKeyMiddleware');
app.use(apiKeyMiddleware);  // ⭐ NOW it will not block /auth/login


// ------------------------------
// PROTECTED ROUTES
// ------------------------------
app.use('/ngos', require('./routes/ngo'));
app.use('/centers', require('./routes/center'));
app.use('/users', require('./routes/user'));
app.use('/attendance', require('./routes/attendance'));
app.use('/students', require('./routes/student'));
app.use('/student-attendance', require('./routes/studentAttendance'));
app.use('/reports', require('./routes/report'));
app.use('/donors', require('./routes/donor'));
app.use('/donations', require('./routes/donation'));
app.use('/reports/donations', require('./routes/donationReports'));


// ------------------------------
// SWAGGER DOCS
// ------------------------------
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// ------------------------------
// POSTGRES CONNECTION
// ------------------------------
const sequelize = require('./db/postgres');

sequelize.authenticate()
  .then(() => {
    console.log("PostgreSQL connected successfully");
    return sequelize.sync({ alter: true });
  })
  .then(() => console.log("Models synced"))
  .catch((err) => console.error("Database error:", err));


// ------------------------------
// START SERVER
// ------------------------------
app.listen(config.PORT, () => {
  console.log(`Server started on port ${config.PORT}`);
});

module.exports = app;
