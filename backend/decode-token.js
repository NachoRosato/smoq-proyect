require("dotenv").config();
const jwt = require("jsonwebtoken");

// Token de ejemplo (reemplaza con tu token real)
const token = process.argv[2];

if (!token) {
  console.log("❌ Por favor proporciona un token como argumento");
  console.log("Uso: node decode-token.js <tu-token>");
  process.exit(1);
}

console.log("🔍 Decodificando token...");
console.log("Token:", token.substring(0, 20) + "...");

try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log("✅ Token válido!");
  console.log("Payload:", decoded);
} catch (error) {
  console.log("❌ Error decodificando token:");
  console.log("Error:", error.name);
  console.log("Mensaje:", error.message);
  console.log("JWT_SECRET configurado:", !!process.env.JWT_SECRET);
}
