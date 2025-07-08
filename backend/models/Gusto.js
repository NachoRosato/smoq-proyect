const mongoose = require("mongoose");

const gustoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre del gusto es requerido"],
      unique: true,
      trim: true,
      maxlength: [50, "El nombre no puede tener más de 50 caracteres"],
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: [200, "La descripción no puede tener más de 200 caracteres"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Gusto", gustoSchema);
