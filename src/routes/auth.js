/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Authentication endpoints
 */

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login user (returns access + refresh token)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthLoginRequest'
 *     responses:
 *       200:
 *         description: Login success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthLoginResponse'
 */

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token using refresh token (rotation)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshRequest'
 *     responses:
 *       200:
 *         description: New tokens
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RefreshResponse'
 */

/**
 * @openapi
 * /auth/request-password-reset:
 *   post:
 *     summary: Request password reset (sends email with link)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RequestPasswordReset'
 *     responses:
 *       200:
 *         description: Generic success response (security best practice)
 */

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPassword'
 *     responses:
 *       200:
 *         description: Password reset success
 */



/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication routes
 */


// src/routes/auth.js

const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

// ⭐ PUBLIC ROUTES -------------------------------------------------

// Register Super Admin (FIRST account only, or protected manually)
router.post('/register-super-admin', authController.registerSuperAdmin);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login success
 */

// Login — returns access + refresh token
router.post('/login', authController.login);

// Refresh access token using refresh token
router.post('/refresh', authController.refreshToken);

// Request password reset (email link)
router.post('/request-password-reset', authController.requestPasswordReset);

// Complete password reset (new password)
router.post('/reset-password', authController.resetPassword);


// EXPORT ROUTER ---------------------------------------------------
module.exports = router;
