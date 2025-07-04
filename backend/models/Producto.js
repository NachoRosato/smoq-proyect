const mongoose = require("mongoose");

const productoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es requerido"],
      trim: true,
      maxlength: [100, "El nombre no puede tener más de 100 caracteres"],
    },
    descripcion: {
      type: String,
      required: [true, "La descripción es requerida"],
      trim: true,
      maxlength: [500, "La descripción no puede tener más de 500 caracteres"],
    },
    precio: {
      type: Number,
      required: [true, "El precio es requerido"],
      min: [0, "El precio no puede ser negativo"],
    },
    imagen: {
      type: String,
      required: [true, "La imagen es requerida"],
    },
    categoria: {
      type: String,
      required: [true, "La categoría es requerida"],
      enum: ["ropa", "accesorios", "calzado", "otros"],
    },
    stock: {
      type: Number,
      required: [true, "El stock es requerido"],
      min: [0, "El stock no puede ser negativo"],
      default: 0,
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índices para búsquedas eficientes
productoSchema.index({ nombre: "text", descripcion: "text" });
productoSchema.index({ categoria: 1 });
productoSchema.index({ activo: 1 });

module.exports = mongoose.model("Producto", productoSchema);
