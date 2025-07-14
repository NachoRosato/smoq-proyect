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
    imagenes: {
      type: [String],
      default: [],
      validate: {
        validator: function (imagenes) {
          return imagenes.length <= 10; // Máximo 10 imágenes
        },
        message: "No se pueden subir más de 10 imágenes por producto",
      },
    },
    categoria: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categoria",
      required: [true, "La categoría es requerida"],
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
    categoriaEliminada: {
      type: Boolean,
      default: false,
    },
    fechaDesactivacion: {
      type: Date,
    },
    gustos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Gusto",
      },
    ],
    stockPorGusto: [
      {
        gusto: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Gusto",
          required: true,
        },
        stock: {
          type: Number,
          required: true,
          min: [0, "El stock no puede ser negativo"],
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Índices para búsquedas eficientes
productoSchema.index({ nombre: "text", descripcion: "text" });
productoSchema.index({ categoria: 1 });
productoSchema.index({ activo: 1 });

// Middleware para mantener compatibilidad hacia atrás
productoSchema.pre("save", function (next) {
  // Si no hay imágenes en el array pero hay imagen principal, usar esa como primera imagen
  if (this.imagenes.length === 0 && this.imagen) {
    this.imagenes = [this.imagen];
  }
  // Si hay imágenes en el array pero no imagen principal, usar la primera como imagen principal
  else if (this.imagenes.length > 0 && !this.imagen) {
    this.imagen = this.imagenes[0];
  }
  next();
});

module.exports = mongoose.model("Producto", productoSchema);
