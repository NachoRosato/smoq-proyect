const { exec } = require("child_process");

console.log("🔍 Verificando disponibilidad de mongodump...");

exec("mongodump --version", (error, stdout, stderr) => {
  if (error) {
    console.error("❌ mongodump no está disponible");
    console.error("Error:", error.message);
    console.log("\n📋 Para instalar MongoDB Database Tools:");
    console.log(
      "1. Windows: https://www.mongodb.com/try/download/database-tools"
    );
    console.log("2. macOS: brew install mongodb/brew/mongodb-database-tools");
    console.log("3. Linux: sudo apt-get install mongodb-database-tools");
    console.log(
      "\n💡 Alternativa: Usar MongoDB Atlas que incluye las herramientas"
    );
  } else {
    console.log("✅ mongodump está disponible");
    console.log("Versión:", stdout.trim());
  }
});

console.log("\n🔍 Verificando variables de entorno...");
console.log(
  "MONGODB_URI:",
  process.env.MONGODB_URI ? "✅ Configurada" : "❌ No configurada"
);
