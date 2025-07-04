const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Usuario = require("./models/Usuario");
require("dotenv").config();

const createAdminUser = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Conectado a MongoDB");

    // Eliminar usuario admin existente si existe
    await Usuario.deleteOne({ email: "admin@smoq.com" });
    console.log("🗑️ Usuario admin anterior eliminado");

    // Crear nuevo usuario admin (sin hashear, el modelo lo hace automáticamente)
    const adminUser = new Usuario({
      nombre: "Administrador",
      email: "admin@smoq.com",
      password: "admin123", // El modelo lo hasheará automáticamente
      rol: "admin",
    });

    await adminUser.save();
    console.log("✅ Usuario administrador creado exitosamente");
    console.log("📧 Email: admin@smoq.com");
    console.log("🔑 Contraseña: admin123");
    console.log("\n🎉 Ya puedes acceder al panel de administración!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

createAdminUser();
