const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 465,
  secure: true, // true para 465, false para otros puertos
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verificar conexión
transporter.verify(function (error, success) {
  if (error) {
    console.error("❌ Error en configuración SMTP:", error);
  } else {
    console.log("✅ Servidor SMTP listo para enviar emails");
  }
});

module.exports = transporter;
