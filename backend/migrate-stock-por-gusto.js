const mongoose = require("mongoose");
const Producto = require("./models/Producto");
const Gusto = require("./models/Gusto");
require("dotenv").config();

async function migrateStockPorGusto() {
  try {
    // Conectar a la base de datos
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/smoq"
    );
    console.log("Conectado a MongoDB");

    // Obtener todos los productos que tienen gustos pero no stockPorGusto
    const productos = await Producto.find({
      gustos: { $exists: true, $ne: [] },
      stockPorGusto: { $exists: false },
    }).populate("gustos");

    console.log(`Encontrados ${productos.length} productos para migrar`);

    for (const producto of productos) {
      console.log(`Migrando producto: ${producto.nombre}`);

      // Crear stockPorGusto basado en los gustos existentes
      const stockPorGusto = producto.gustos.map((gusto) => ({
        gusto: gusto._id,
        stock: producto.stock, // Usar el stock general como stock inicial para cada gusto
      }));

      // Actualizar el producto
      await Producto.findByIdAndUpdate(producto._id, {
        $set: { stockPorGusto },
      });

      console.log(`Producto ${producto.nombre} migrado exitosamente`);
    }

    console.log("Migración completada exitosamente");
  } catch (error) {
    console.error("Error durante la migración:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Desconectado de MongoDB");
  }
}

// Ejecutar la migración si se llama directamente
if (require.main === module) {
  migrateStockPorGusto();
}

module.exports = migrateStockPorGusto;
