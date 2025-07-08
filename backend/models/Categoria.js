const mongoose = require("mongoose");

const categoriaSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre de la categoría es requerido"],
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

module.exports = mongoose.model("Categoria", categoriaSchema);
