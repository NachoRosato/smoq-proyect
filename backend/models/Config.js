const mongoose = require("mongoose");

const configSchema = new mongoose.Schema(
  {
    minFreeShipping: {
      type: Number,
      required: true,
      default: 25000,
    },
    freeShippingEnabled: {
      type: Boolean,
      default: true,
    },
    descuentoGeneralEnabled: {
      type: Boolean,
      default: false,
    },
    descuentoGeneralPorcentaje: {
      type: Number,
      min: [0, "El descuento no puede ser negativo"],
      max: [100, "El descuento no puede ser mayor al 100%"],
      default: 0,
    },
    whatsappNumber: {
      type: String,
      default: "",
    },
    whatsappTitle: {
      type: String,
      default: "Nuevo Pedido - SMOQ",
    },
    whatsappDescription: {
      type: String,
      default:
        "Somos SMOQ y acabas de tomar la mejor decisión de tu vida. Gracias por elegirnos!",
    },
    whatsappGoodbye: {
      type: String,
      default: "Enviado desde la tienda online",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Config", configSchema);
