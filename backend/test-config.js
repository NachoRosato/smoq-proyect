const mongoose = require("mongoose");
const Config = require("./models/Config");
require("dotenv").config();

async function testConfig() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Probar crear configuración
    const testConfig = await Config.create({
      minFreeShipping: 25000,
      whatsappNumber: "+54 9 11 1234-5678",
    });

    // Probar actualizar configuración
    testConfig.whatsappNumber = "+54 9 11 8765-4321";
    await testConfig.save();

    // Probar buscar configuración
    const foundConfig = await Config.findOne();
  } catch (error) {
    console.error("❌ Error en las pruebas:", error);
  } finally {
    await mongoose.disconnect();
  }
}

testConfig();
