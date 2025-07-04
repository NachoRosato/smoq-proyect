const express = require("express");
const router = express.Router();
const Config = require("../models/Config");
const verifyToken = require("../middleware/verifyToken");

// Obtener configuración
router.get("/", async (req, res) => {
  try {
    let config = await Config.findOne();
    if (!config) {
      config = await Config.create({ minFreeShipping: 25000 });
    }
    res.json({ success: true, config });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Actualizar configuración (solo admin)
router.put("/", verifyToken, async (req, res) => {
  try {
    const { minFreeShipping } = req.body;
    let config = await Config.findOne();
    if (!config) {
      config = await Config.create({ minFreeShipping });
    } else {
      config.minFreeShipping = minFreeShipping;
      await config.save();
    }
    res.json({ success: true, config });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
