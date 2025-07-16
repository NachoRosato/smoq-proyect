const mongoose = require("mongoose");

const pedidoSchema = new mongoose.Schema(
  {
    nombreCliente: {
      type: String,
      required: [true, "El nombre del cliente es requerido"],
      trim: true,
      maxlength: [100, "El nombre no puede tener más de 100 caracteres"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Email inválido"],
    },
    telefono: {
      type: String,
      trim: true,
      maxlength: [20, "El teléfono no puede tener más de 20 caracteres"],
    },
    productos: [
      {
        productoId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Producto",
          required: true,
        },
        nombre: {
          type: String,
          required: true,
        },
        precio: {
          type: Number,
          required: true,
        },
        cantidad: {
          type: Number,
          required: true,
          min: [1, "La cantidad debe ser al menos 1"],
        },
        subtotal: {
          type: Number,
          required: true,
        },
        gustoId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Gusto",
        },
        gustoNombre: {
          type: String,
          trim: true,
        },
      },
    ],
    total: {
      type: Number,
      required: true,
      min: [0, "El total no puede ser negativo"],
    },
    estado: {
      type: String,
      enum: ["pendiente", "confirmado", "enviado", "entregado", "cancelado"],
      default: "pendiente",
    },
    metodoContacto: {
      type: String,
      enum: ["email", "whatsapp"],
      required: true,
    },
    notas: {
      type: String,
      trim: true,
      maxlength: [500, "Las notas no pueden tener más de 500 caracteres"],
    },
  },
  {
    timestamps: true,
  }
);

// Validar que al menos email o teléfono esté presente
pedidoSchema.pre("validate", function (next) {
  if (!this.email && !this.telefono) {
    this.invalidate("email", "Debe proporcionar al menos un email o teléfono");
  }
  next();
});

// Calcular total automáticamente
pedidoSchema.pre("save", function (next) {
  if (this.productos && this.productos.length > 0) {
    this.total = this.productos.reduce((sum, item) => sum + item.subtotal, 0);
  }
  next();
});

// Índices para búsquedas eficientes
pedidoSchema.index({ estado: 1 });
pedidoSchema.index({ createdAt: -1 });
pedidoSchema.index({ nombreCliente: "text" });

module.exports = mongoose.model("Pedido", pedidoSchema);
