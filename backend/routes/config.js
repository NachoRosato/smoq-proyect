const express = require("express");
const router = express.Router();
const Config = require("../models/Config");
const verifyToken = require("../middleware/verifyToken");
const Categoria = require("../models/Categoria");
const Gusto = require("../models/Gusto");

// Obtener configuración
router.get("/", async (req, res) => {
  try {
    let config = await Config.findOne();
    if (!config) {
      config = await Config.create({
        minFreeShipping: 25000,
        whatsappNumber: "",
        whatsappTitle: "Nuevo Pedido - SMOQ",
        whatsappDescription:
          "Somos SMOQ y acabas de tomar la mejor decisión de tu vida. Gracias por elegirnos!",
        whatsappGoodbye: "Enviado desde la tienda online",
      });
    }
    res.json({ success: true, config });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Actualizar configuración (solo admin)
router.put("/", verifyToken, async (req, res) => {
  try {
    const {
      minFreeShipping,
      whatsappNumber,
      whatsappTitle,
      whatsappDescription,
      whatsappGoodbye,
    } = req.body;

    let config = await Config.findOne();

    if (!config) {
      config = await Config.create({
        minFreeShipping: minFreeShipping || 25000,
        whatsappNumber: whatsappNumber || "",
        whatsappTitle: whatsappTitle || "Nuevo Pedido - SMOQ",
        whatsappDescription:
          whatsappDescription ||
          "Somos SMOQ y acabas de tomar la mejor decisión de tu vida. Gracias por elegirnos!",
        whatsappGoodbye: whatsappGoodbye || "Enviado desde la tienda online",
      });
    } else {
      if (minFreeShipping !== undefined) {
        config.minFreeShipping = minFreeShipping;
      }
      if (whatsappNumber !== undefined) {
        config.whatsappNumber = whatsappNumber;
      }
      if (whatsappTitle !== undefined) {
        config.whatsappTitle = whatsappTitle;
      }
      if (whatsappDescription !== undefined) {
        config.whatsappDescription = whatsappDescription;
      }
      if (whatsappGoodbye !== undefined) {
        config.whatsappGoodbye = whatsappGoodbye;
      }
      await config.save();
    }

    res.json({ success: true, config });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener todas las categorías
router.get("/categorias", async (req, res) => {
  try {
    const categorias = await Categoria.find();
    res.json(categorias);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener categorías" });
  }
});

// Crear una nueva categoría
router.post("/categorias", verifyToken, async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const nuevaCategoria = new Categoria({ nombre, descripcion });
    await nuevaCategoria.save();
    res.status(201).json(nuevaCategoria);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Editar una categoría existente
router.put("/categorias/:id", verifyToken, async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const categoria = await Categoria.findByIdAndUpdate(
      req.params.id,
      { nombre, descripcion },
      { new: true, runValidators: true }
    );
    if (!categoria)
      return res.status(404).json({ error: "Categoría no encontrada" });
    res.json(categoria);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar una categoría
router.delete("/categorias/:id", verifyToken, async (req, res) => {
  try {
    const categoria = await Categoria.findByIdAndDelete(req.params.id);
    if (!categoria)
      return res.status(404).json({ error: "Categoría no encontrada" });
    res.json({ mensaje: "Categoría eliminada" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar categoría" });
  }
});

// Obtener todos los gustos
router.get("/gustos", async (req, res) => {
  try {
    const gustos = await Gusto.find();
    res.json(gustos);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener gustos" });
  }
});

// Crear un nuevo gusto
router.post("/gustos", verifyToken, async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const nuevoGusto = new Gusto({ nombre, descripcion });
    await nuevoGusto.save();
    res.status(201).json(nuevoGusto);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Editar un gusto existente
router.put("/gustos/:id", verifyToken, async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const gusto = await Gusto.findByIdAndUpdate(
      req.params.id,
      { nombre, descripcion },
      { new: true, runValidators: true }
    );
    if (!gusto) return res.status(404).json({ error: "Gusto no encontrado" });
    res.json(gusto);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar un gusto
router.delete("/gustos/:id", verifyToken, async (req, res) => {
  try {
    const gusto = await Gusto.findByIdAndDelete(req.params.id);
    if (!gusto) return res.status(404).json({ error: "Gusto no encontrado" });
    res.json({ mensaje: "Gusto eliminado" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar gusto" });
  }
});

module.exports = router;
