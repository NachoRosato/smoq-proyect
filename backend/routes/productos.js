const express = require("express");
const Producto = require("../models/Producto");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();

// GET /productos - Obtener todos los productos (público)
router.get("/", async (req, res) => {
  try {
    const {
      categoria,
      search,
      limit = 20,
      page = 1,
      showInactive = false,
    } = req.query;
    const query = {};

    // Por defecto traer todos los productos (activos e inactivos)
    // El frontend se encarga de filtrar según necesite

    if (categoria) query.categoria = categoria;
    if (search) query.$text = { $search: search };

    const productos = await Producto.find(query)
      .populate("categoria")
      .populate("gustos")
      .populate("stockPorGusto.gusto")
      .sort({ createdAt: -1 }) // Ordenar por fecha de creación, más recientes primero
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
    })
      .populate("categoria")
      .populate("gustos")
      .populate("stockPorGusto.gusto");

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

// GET /productos/:id/stock/:gustoId - Obtener stock de un gusto específico (público)
router.get("/:id/stock/:gustoId", async (req, res) => {
  try {
    const producto = await Producto.findOne({
      _id: req.params.id,
      activo: true,
    }).populate("stockPorGusto.gusto");

    if (!producto) {
      return res.status(404).json({
        message: "Producto no encontrado",
      });
    }

    const stockGusto = producto.stockPorGusto.find(
      (sg) => sg.gusto._id.toString() === req.params.gustoId
    );

    if (!stockGusto) {
      return res.status(404).json({
        message: "Gusto no encontrado en este producto",
      });
    }

    res.json({
      gusto: stockGusto.gusto,
      stock: stockGusto.stock,
    });
  } catch (error) {
    console.error("Error obteniendo stock del gusto:", error);
    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
});

// Función para validar imagen (base64 o URL)
function isValidImage(image, maxSizeMB = 2) {
  // Si es base64, validar formato y tamaño
  if (image.startsWith("data:image/")) {
    if (
      !image.startsWith("data:image/png;base64,") &&
      !image.startsWith("data:image/jpeg;base64,") &&
      !image.startsWith("data:image/jpg;base64,")
    ) {
      return false;
    }

    // Calcular tamaño en bytes
    const base64Str = image.split(",")[1] || "";
    const sizeInBytes =
      (base64Str.length * 3) / 4 -
      (base64Str.endsWith("==") ? 2 : base64Str.endsWith("=") ? 1 : 0);
    return sizeInBytes <= maxSizeMB * 1024 * 1024;
  }

  // Si es URL, validar que sea una URL válida
  if (image.startsWith("http://") || image.startsWith("https://")) {
    try {
      new URL(image);
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

// Función para validar múltiples imágenes
function validateImages(imagenes) {
  if (!Array.isArray(imagenes)) return false;
  if (imagenes.length === 0) return false;
  if (imagenes.length > 10) return false;

  for (const imagen of imagenes) {
    if (!isValidImage(imagen)) {
      return false;
    }
  }
  return true;
}

// POST /productos - Crear producto (protegido)
router.post("/", verifyToken, async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      precio,
      imagen,
      imagenes,
      categoria,
      stock,
      gustos,
      stockPorGusto,
    } = req.body;

    // Validar campos requeridos
    if (!nombre || !descripcion || !precio || !categoria) {
      return res.status(400).json({
        message: "Todos los campos son requeridos",
      });
    }

    // Validar imágenes
    let imagenesValidas = [];

    // Si se proporcionan múltiples imágenes, validarlas
    if (imagenes && Array.isArray(imagenes) && imagenes.length > 0) {
      if (!validateImages(imagenes)) {
        return res.status(400).json({
          message:
            "Las imágenes deben ser URLs válidas o base64 PNG/JPG/JPEG y pesar menos de 2MB cada una. Máximo 10 imágenes.",
        });
      }
      imagenesValidas = imagenes;
    }
    // Si solo se proporciona una imagen, validarla
    else if (imagen) {
      if (!isValidImage(imagen)) {
        return res.status(400).json({
          message:
            "La imagen debe ser una URL válida o base64 PNG/JPG/JPEG y pesar menos de 2MB",
        });
      }
      imagenesValidas = [imagen];
    } else {
      return res.status(400).json({
        message: "Al menos una imagen es requerida",
      });
    }

    // Validar que si hay gustos, debe haber stock por gusto
    if (gustos && gustos.length > 0) {
      if (!stockPorGusto || stockPorGusto.length === 0) {
        return res.status(400).json({
          message: "Debe especificar el stock para cada gusto seleccionado",
        });
      }

      // Validar que todos los gustos tengan stock definido
      const gustosIds = gustos.map((g) => g.toString());
      const stockGustosIds = stockPorGusto.map((s) => s.gusto.toString());

      const gustosSinStock = gustosIds.filter(
        (id) => !stockGustosIds.includes(id)
      );
      if (gustosSinStock.length > 0) {
        return res.status(400).json({
          message: "Todos los gustos seleccionados deben tener stock definido",
        });
      }
    }

    const producto = new Producto({
      nombre,
      descripcion,
      precio: parseFloat(precio),
      imagen: imagenesValidas[0], // Primera imagen como imagen principal
      imagenes: imagenesValidas,
      categoria,
      stock: parseInt(stock) || 0,
      gustos: gustos || [],
      stockPorGusto: stockPorGusto || [],
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
      imagenes,
      categoria,
      stock,
      activo,
      gustos,
      stockPorGusto,
    } = req.body;

    const producto = await Producto.findById(req.params.id);

    if (!producto) {
      return res.status(404).json({
        message: "Producto no encontrado",
      });
    }

    // Validar imágenes si se actualizan
    let imagenesValidas = producto.imagenes || [producto.imagen];

    if (imagenes && Array.isArray(imagenes) && imagenes.length > 0) {
      if (!validateImages(imagenes)) {
        return res.status(400).json({
          message:
            "Las imágenes deben ser URLs válidas o base64 PNG/JPG/JPEG y pesar menos de 2MB cada una. Máximo 10 imágenes.",
        });
      }
      imagenesValidas = imagenes;
    } else if (
      imagen &&
      (imagen.startsWith("data:image/") || imagen.startsWith("http"))
    ) {
      if (!isValidImage(imagen)) {
        return res.status(400).json({
          message:
            "La imagen debe ser una URL válida o base64 PNG/JPG/JPEG y pesar menos de 2MB",
        });
      }
      imagenesValidas = [imagen];
    }

    // Validar que si hay gustos, debe haber stock por gusto
    if (gustos && gustos.length > 0) {
      if (!stockPorGusto || stockPorGusto.length === 0) {
        return res.status(400).json({
          message: "Debe especificar el stock para cada gusto seleccionado",
        });
      }

      // Validar que todos los gustos tengan stock definido
      const gustosIds = gustos.map((g) => g.toString());
      const stockGustosIds = stockPorGusto.map((s) => s.gusto.toString());

      const gustosSinStock = gustosIds.filter(
        (id) => !stockGustosIds.includes(id)
      );
      if (gustosSinStock.length > 0) {
        return res.status(400).json({
          message: "Todos los gustos seleccionados deben tener stock definido",
        });
      }
    }

    // Actualizar campos
    if (nombre) producto.nombre = nombre;
    if (descripcion) producto.descripcion = descripcion;
    if (precio) producto.precio = parseFloat(precio);
    if (imagenesValidas.length > 0) {
      producto.imagen = imagenesValidas[0]; // Primera imagen como imagen principal
      producto.imagenes = imagenesValidas;
    }
    if (categoria) producto.categoria = categoria;
    if (stock !== undefined) producto.stock = parseInt(stock);
    if (activo !== undefined) producto.activo = activo;
    if (gustos) producto.gustos = gustos;
    if (stockPorGusto) producto.stockPorGusto = stockPorGusto;

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

// DELETE /productos/:id/permanent - Eliminar producto definitivamente (protegido)
router.delete("/:id/permanent", verifyToken, async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);

    if (!producto) {
      return res.status(404).json({
        message: "Producto no encontrado",
      });
    }

    // Eliminación definitiva de la base de datos
    await Producto.findByIdAndDelete(req.params.id);

    res.json({
      message: "Producto eliminado definitivamente de la base de datos",
    });
  } catch (error) {
    console.error("Error eliminando producto definitivamente:", error);
    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
});

module.exports = router;
