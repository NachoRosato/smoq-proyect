const express = require("express");
const Producto = require("../models/Producto");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();

// GET /productos - Obtener todos los productos (público)
router.get("/", async (req, res) => {
  try {
    const { categoria, search, limit = 20, page = 1 } = req.query;

    let query = { activo: true };

    // Filtro por categoría
    if (categoria) {
      query.categoria = categoria;
    }

    // Búsqueda por texto
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const productos = await Producto.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Producto.countDocuments(query);

    res.json({
      productos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error obteniendo productos:", error);
    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
});

// GET /productos/:id - Obtener producto por ID (público)
router.get("/:id", async (req, res) => {
  try {
    const producto = await Producto.findOne({
      _id: req.params.id,
      activo: true,
    });

    if (!producto) {
      return res.status(404).json({
        message: "Producto no encontrado",
      });
    }

    res.json(producto);
  } catch (error) {
    console.error("Error obteniendo producto:", error);
    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
});

// POST /productos - Crear producto (protegido)
router.post("/", verifyToken, async (req, res) => {
  try {
    const { nombre, descripcion, precio, imagen, categoria, stock } = req.body;

    // Validar campos requeridos
    if (!nombre || !descripcion || !precio || !imagen || !categoria) {
      return res.status(400).json({
        message: "Todos los campos son requeridos",
      });
    }

    const producto = new Producto({
      nombre,
      descripcion,
      precio: parseFloat(precio),
      imagen,
      categoria,
      stock: parseInt(stock) || 0,
    });

    await producto.save();

    res.status(201).json({
      message: "Producto creado exitosamente",
      producto,
    });
  } catch (error) {
    console.error("Error creando producto:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Datos inválidos",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }
    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
});

// PUT /productos/:id - Actualizar producto (protegido)
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { nombre, descripcion, precio, imagen, categoria, stock, activo } =
      req.body;

    const producto = await Producto.findById(req.params.id);

    if (!producto) {
      return res.status(404).json({
        message: "Producto no encontrado",
      });
    }

    // Actualizar campos
    if (nombre) producto.nombre = nombre;
    if (descripcion) producto.descripcion = descripcion;
    if (precio) producto.precio = parseFloat(precio);
    if (imagen) producto.imagen = imagen;
    if (categoria) producto.categoria = categoria;
    if (stock !== undefined) producto.stock = parseInt(stock);
    if (activo !== undefined) producto.activo = activo;

    await producto.save();

    res.json({
      message: "Producto actualizado exitosamente",
      producto,
    });
  } catch (error) {
    console.error("Error actualizando producto:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Datos inválidos",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }
    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
});

// DELETE /productos/:id - Eliminar producto (protegido)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);

    if (!producto) {
      return res.status(404).json({
        message: "Producto no encontrado",
      });
    }

    // Soft delete - marcar como inactivo
    producto.activo = false;
    await producto.save();

    res.json({
      message: "Producto eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error eliminando producto:", error);
    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
});

module.exports = router;
