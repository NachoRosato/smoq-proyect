const mongoose = require("mongoose");
const { cleanupOrphanReferences } = require("./utils/referentialIntegrity");
require("./config/db");

async function runCleanup() {
  try {
    console.log("🧹 Iniciando limpieza de referencias huérfanas...");

    const result = await cleanupOrphanReferences();

    if (result.success) {
      console.log("✅ Limpieza completada exitosamente");
      console.log(`📊 Resultados:`);
      console.log(
        `   - Productos con categorías huérfanas: ${result.categoriasHuerfanas}`
      );
      console.log(
        `   - Productos con gustos huérfanos: ${result.gustosHuerfanos}`
      );
    } else {
      console.error("❌ Error durante la limpieza:", result.error);
    }
  } catch (error) {
    console.error("❌ Error fatal durante la limpieza:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Conexión a la base de datos cerrada");
    process.exit(0);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runCleanup();
}

module.exports = { runCleanup };
