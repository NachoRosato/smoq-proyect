const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Usuario = require("./models/Usuario");
require("dotenv").config();

const createAdminUser = async () => {
  try {
    // Verificar que se proporcionen las credenciales
    const email = process.argv[2];
    const password = process.argv[3];

    if (!email || !password) {
      console.log("❌ Uso: node createAdmin.js <email> <password>");
      console.log(
        "Ejemplo: node createAdmin.js admin@tudominio.com miPasswordSeguro123"
      );
      process.exit(1);
    }

    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    // Eliminar usuario admin existente si existe
    await Usuario.deleteOne({ email: email });

    // Crear nuevo usuario admin
    const adminUser = new Usuario({
      nombre: "Administrador",
      email: email,
      password: password, // El modelo lo hasheará automáticamente
      rol: "admin",
    });

    await adminUser.save();
    console.log("✅ Usuario administrador creado exitosamente");
    console.log(`📧 Email: ${email}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

createAdminUser();
