require("dotenv").config();

console.log("🔍 Verificando variables de entorno...");
console.log(
  "MONGODB_URI:",
  process.env.MONGODB_URI ? "✅ Configurada" : "❌ No configurada"
);
console.log(
  "JWT_SECRET:",
  process.env.JWT_SECRET ? "✅ Configurada" : "❌ No configurada"
);
console.log("PORT:", process.env.PORT || "3002");

if (process.env.JWT_SECRET) {
  console.log("JWT_SECRET length:", process.env.JWT_SECRET.length);
}
