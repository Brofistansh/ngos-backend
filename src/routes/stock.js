const express = require("express");
const router = express.Router();

const auth = require("../middlewares/authMiddleware");
const roles = require("../middlewares/roleMiddleware");
const controller = require("../controllers/stockController");

// CREATE
router.post("/", auth, roles("teacher"), controller.createStock);

// GET
router.get("/", auth, roles("teacher"), controller.getStock);
router.get("/", auth, roles("manager", "super_admin"), controller.getStock);
router.get("/filter", auth, roles("manager", "super_admin"), controller.getStock);

// UPDATE ENTRY
router.put(
  "/entry/:id",
  auth,
  roles("teacher"),
  controller.updateStockEntry
);

// DELETE ENTRY
router.delete(
  "/entry/:id",
  auth,
  roles("teacher"),
  controller.deleteStockEntry
);

module.exports = router;
