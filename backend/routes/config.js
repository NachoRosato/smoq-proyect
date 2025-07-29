const express = require("express");
const router = express.Router();
const Config = require("../models/Config");
const verifyToken = require("../middleware/verifyToken");
const Categoria = require("../models/Categoria");
const Gusto = require("../models/Gusto");
const {
  updateProductosOnCategoriaDelete,
  updateProductosOnGustoDelete,
  updateProductosOnCategoriaUpdate,
  updateProductosOnGustoUpdate,
  cleanupOrphanReferences,
} = require("../utils/referentialIntegrity");

// Obtener configuración
router.get("/", async (req, res) => {
  try {
    let config = await Config.findOne();
    if (!config) {
      config = await Config.create({
        minFreeShipping: 25000,
        freeShippingEnabled: true,
        descuentoGeneralEnabled: false,
        descuentoGeneralPorcentaje: 0,
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
      freeShippingEnabled,
      descuentoGeneralEnabled,
      descuentoGeneralPorcentaje,
      whatsappNumber,
      whatsappTitle,
      whatsappDescription,
      whatsappGoodbye,
    } = req.body;

    let config = await Config.findOne();

    if (!config) {
      config = await Config.create({
        minFreeShipping: minFreeShipping || 25000,
        freeShippingEnabled:
          freeShippingEnabled !== undefined ? freeShippingEnabled : true,
        descuentoGeneralEnabled:
          descuentoGeneralEnabled !== undefined
            ? descuentoGeneralEnabled
            : false,
        descuentoGeneralPorcentaje: descuentoGeneralPorcentaje || 0,
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
      if (freeShippingEnabled !== undefined) {
        config.freeShippingEnabled = freeShippingEnabled;
      }
      if (descuentoGeneralEnabled !== undefined) {
        config.descuentoGeneralEnabled = descuentoGeneralEnabled;
      }
      if (descuentoGeneralPorcentaje !== undefined) {
        config.descuentoGeneralPorcentaje = descuentoGeneralPorcentaje;
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

    // Obtener datos anteriores para comparación
    const categoriaAnterior = await Categoria.findById(req.params.id);
    if (!categoriaAnterior) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    const categoria = await Categoria.findByIdAndUpdate(
      req.params.id,
      { nombre, descripcion },
      { new: true, runValidators: true }
    );

    // Actualizar productos que usan esta categoría
    const updateResult = await updateProductosOnCategoriaUpdate(
      req.params.id,
      categoriaAnterior,
      categoria
    );

    res.json({
      categoria,
      productosActualizados: updateResult,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar una categoría
router.delete("/categorias/:id", verifyToken, async (req, res) => {
  try {
    const categoria = await Categoria.findByIdAndDelete(req.params.id);
    if (!categoria) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    // Actualizar productos que usan esta categoría
    const updateResult = await updateProductosOnCategoriaDelete(req.params.id);

    res.json({
      mensaje: "Categoría eliminada",
      productosActualizados: updateResult,
    });
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

    // Obtener datos anteriores para comparación
    const gustoAnterior = await Gusto.findById(req.params.id);
    if (!gustoAnterior) {
      return res.status(404).json({ error: "Gusto no encontrado" });
    }

    const gusto = await Gusto.findByIdAndUpdate(
      req.params.id,
      { nombre, descripcion },
      { new: true, runValidators: true }
    );

    // Actualizar productos que usan este gusto
    const updateResult = await updateProductosOnGustoUpdate(
      req.params.id,
      gustoAnterior,
      gusto
    );

    res.json({
      gusto,
      productosActualizados: updateResult,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar un gusto
router.delete("/gustos/:id", verifyToken, async (req, res) => {
  try {
    const gusto = await Gusto.findByIdAndDelete(req.params.id);
    if (!gusto) {
      return res.status(404).json({ error: "Gusto no encontrado" });
    }

    // Actualizar productos que usan este gusto
    const updateResult = await updateProductosOnGustoDelete(req.params.id);

    res.json({
      mensaje: "Gusto eliminado",
      productosActualizados: updateResult,
    });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar gusto" });
  }
});

// Limpiar referencias huérfanas (solo admin)
router.post("/cleanup", verifyToken, async (req, res) => {
  try {
    const result = await cleanupOrphanReferences();
    res.json({
      success: true,
      message: "Limpieza completada",
      result,
    });
  } catch (err) {
    res.status(500).json({ error: "Error al limpiar referencias huérfanas" });
  }
});

module.exports = router;
