const nodemailer = require("nodemailer");
require("dotenv").config();

// Configuración alternativa con Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER, // tu-email@gmail.com
    pass: process.env.GMAIL_APP_PASSWORD, // contraseña de aplicación
  },
});

// Verificar conexión
transporter.verify(function (error, success) {
  if (error) {
    console.error("❌ Error en configuración Gmail:", error);
  } else {
    // console.log("✅ Servidor Gmail listo para enviar emails");
  }
});

module.exports = transporter;
