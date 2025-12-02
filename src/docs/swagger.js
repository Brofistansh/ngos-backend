// src/docs/swagger.js
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const router = express.Router();

// load YAML (openapi.yaml should be at repo root)
const specPath = path.resolve(__dirname, '../../openapi.yaml');
const swaggerDocument = YAML.load(specPath);

router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerDocument, { explorer: true }));

module.exports = router;
