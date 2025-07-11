const mongoose = require("mongoose");
const Producto = require("./models/Producto");

// Configuración directa de MongoDB (usar la misma que en env.example)
const MONGODB_URI =
  "mongodb+srv://ignaciorosato:pXY9elz95BIzW8yb@clustersmoq.5vt0p1y.mongodb.net/?retryWrites=true&w=majority&appName=ClusterSmoq";

async function migrateImages() {
  try {
    console.log("🔄 Iniciando migración de imágenes...");

    // Conectar a la base de datos
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Conexión a MongoDB establecida");

    // Obtener todos los productos
    const productos = await Producto.find({});
    console.log(`📦 Encontrados ${productos.length} productos para migrar`);

    let updatedCount = 0;

    for (const producto of productos) {
      // Si el producto no tiene el campo imagenes o está vacío, pero tiene imagen
      if (
        (!producto.imagenes || producto.imagenes.length === 0) &&
        producto.imagen
      ) {
        // Agregar la imagen principal al array de imágenes
        producto.imagenes = [producto.imagen];

        // Guardar el producto actualizado
        await producto.save();
        updatedCount++;

        console.log(`✅ Producto "${producto.nombre}" migrado`);
      }
    }

    console.log(
      `🎉 Migración completada. ${updatedCount} productos actualizados.`
    );
  } catch (error) {
    console.error("❌ Error durante la migración:", error);
  } finally {
    // Cerrar la conexión a la base de datos
    await mongoose.connection.close();
    console.log("🔌 Conexión a la base de datos cerrada.");
  }
}

// Ejecutar la migración
migrateImages();
