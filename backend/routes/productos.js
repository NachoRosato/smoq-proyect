const express = require("express");
const Producto = require("../models/Producto");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();

// GET /productos - Obtener todos los productos (público)
router.get("/", async (req, res) => {
  try {
    const { categoria, search, limit = 20, page = 1 } = req.query;
    const query = {};
    if (categoria) query.categoria = categoria;
    if (search) query.$text = { $search: search };
    const productos = await Producto.find(query)
      .populate("categoria")
      .populate("gustos")
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener productos" });
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

// Función para validar imagen base64 PNG/JPG y tamaño
function isValidBase64Image(base64, maxSizeMB = 2) {
  // Validar que sea PNG o JPG/JPEG
  if (
    !base64.startsWith("data:image/png;base64,") &&
    !base64.startsWith("data:image/jpeg;base64,") &&
    !base64.startsWith("data:image/jpg;base64,")
  ) {
    return false;
  }

  // Calcular tamaño en bytes
  const base64Str = base64.split(",")[1] || "";
  const sizeInBytes =
    (base64Str.length * 3) / 4 -
    (base64Str.endsWith("==") ? 2 : base64Str.endsWith("=") ? 1 : 0);
  return sizeInBytes <= maxSizeMB * 1024 * 1024;
}

// POST /productos - Crear producto (protegido)
router.post("/", verifyToken, async (req, res) => {
  try {
    const { nombre, descripcion, precio, imagen, categoria, stock, gustos } =
      req.body;

    // Validar campos requeridos
    if (!nombre || !descripcion || !precio || !imagen || !categoria) {
      return res.status(400).json({
        message: "Todos los campos son requeridos",
      });
    }

    // Validar imagen
    if (imagen.startsWith("data:image/")) {
      if (!isValidBase64Image(imagen)) {
        return res.status(400).json({
          message: "La imagen debe ser PNG, JPG o JPEG y pesar menos de 2MB",
        });
      }
    }

    const producto = new Producto({
      nombre,
      descripcion,
      precio: parseFloat(precio),
      imagen,
      categoria,
      stock: parseInt(stock) || 0,
      gustos: gustos || [],
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
    const {
      nombre,
      descripcion,
      precio,
      imagen,
      categoria,
      stock,
      activo,
      gustos,
    } = req.body;

    const producto = await Producto.findById(req.params.id);

    if (!producto) {
      return res.status(404).json({
        message: "Producto no encontrado",
      });
    }

    // Validar imagen si se actualiza
    if (imagen && imagen.startsWith("data:image/")) {
      if (!isValidBase64Image(imagen)) {
        return res.status(400).json({
          message: "La imagen debe ser PNG, JPG o JPEG y pesar menos de 2MB",
        });
      }
    }

    // Actualizar campos
    if (nombre) producto.nombre = nombre;
    if (descripcion) producto.descripcion = descripcion;
    if (precio) producto.precio = parseFloat(precio);
    if (imagen) producto.imagen = imagen;
    if (categoria) producto.categoria = categoria;
    if (stock !== undefined) producto.stock = parseInt(stock);
    if (activo !== undefined) producto.activo = activo;
    if (gustos) producto.gustos = gustos;

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
