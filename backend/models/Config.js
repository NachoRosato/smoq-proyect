const mongoose = require("mongoose");

const configSchema = new mongoose.Schema(
  {
    minFreeShipping: {
      type: Number,
      required: true,
      default: 25000,
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
