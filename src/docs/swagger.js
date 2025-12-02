const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "NGO Management API",
      version: "1.0.0",
      description: "API documentation for NGO backend",
    },
    servers: [
      {
        url: process.env.RENDER_EXTERNAL_URL || "http://localhost:4000",
      },
    ],
  },

  apis: ["./src/routes/*.js"], // <– all route files
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
