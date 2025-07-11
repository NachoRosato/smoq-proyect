const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Usuario = require("./models/Usuario");
require("dotenv").config();

const createAdminUser = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    // Eliminar usuario admin existente si existe
    await Usuario.deleteOne({ email: "admin@smoq.com" });

    // Crear nuevo usuario admin (sin hashear, el modelo lo hace automáticamente)
    const adminUser = new Usuario({
      nombre: "Administrador",
      email: "admin@smoq.com",
      password: "admin123", // El modelo lo hasheará automáticamente
      rol: "admin",
    });

    await adminUser.save();

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

createAdminUser();
