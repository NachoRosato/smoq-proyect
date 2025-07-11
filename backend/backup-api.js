const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

class DatabaseBackupAPI {
  constructor() {
    this.backupDir = path.join(__dirname, "backups");
    this.ensureBackupDirectory();
  }

  // Crear directorio de backups si no existe
  ensureBackupDirectory() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  // Generar nombre de archivo con timestamp
  generateBackupFileName() {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, -5);
    return `smoq-backup-api-${timestamp}.json`;
  }

  // Conectar a MongoDB
  async connectToMongo() {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("✅ Conectado a MongoDB");
    } catch (error) {
      console.error("❌ Error conectando a MongoDB:", error);
      throw error;
    }
  }

  // Hacer backup usando la API de MongoDB
  async createBackup() {
    try {
      await this.connectToMongo();

      const fileName = this.generateBackupFileName();
      const filePath = path.join(this.backupDir, fileName);

      console.log("🔄 Iniciando backup usando API de MongoDB...");
      console.log(`📁 Archivo: ${fileName}`);

      // Obtener todas las colecciones
      const collections = await mongoose.connection.db
        .listCollections()
        .toArray();
      const backupData = {
        timestamp: new Date().toISOString(),
        collections: {},
      };

      // Hacer backup de cada colección
      for (const collection of collections) {
        const collectionName = collection.name;
        console.log(`📦 Respaldando colección: ${collectionName}`);

        const documents = await mongoose.connection.db
          .collection(collectionName)
          .find({})
          .toArray();

        backupData.collections[collectionName] = documents;
      }

      // Guardar backup en archivo JSON
      fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));

      // Obtener tamaño del archivo
      const stats = fs.statSync(filePath);
      const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

      console.log("✅ Backup completado exitosamente");
      console.log(`📦 Archivo guardado: ${filePath}`);
      console.log(`📏 Tamaño: ${fileSizeInMB} MB`);

      return {
        fileName,
        filePath,
        size: fileSizeInMB,
        timestamp: new Date().toISOString(),
        collections: Object.keys(backupData.collections).length,
      };
    } catch (error) {
      console.error("❌ Error en createBackup:", error);
      throw error;
    } finally {
      await mongoose.connection.close();
    }
  }

  // Restaurar backup
  async restoreBackup(fileName) {
    try {
      await this.connectToMongo();

      const filePath = path.join(this.backupDir, fileName);

      if (!fs.existsSync(filePath)) {
        throw new Error(`Archivo de backup no encontrado: ${fileName}`);
      }

      console.log("🔄 Iniciando restauración...");
      console.log(`📁 Archivo: ${fileName}`);

      // Leer archivo de backup
      const backupData = JSON.parse(fs.readFileSync(filePath, "utf8"));

      // Restaurar cada colección
      for (const [collectionName, documents] of Object.entries(
        backupData.collections
      )) {
        console.log(`📦 Restaurando colección: ${collectionName}`);

        // Limpiar colección existente
        await mongoose.connection.db.collection(collectionName).deleteMany({});

        // Insertar documentos
        if (documents.length > 0) {
          await mongoose.connection.db
            .collection(collectionName)
            .insertMany(documents);
        }
      }

      console.log("✅ Restauración completada exitosamente");
      return { success: true };
    } catch (error) {
      console.error("❌ Error en restoreBackup:", error);
      throw error;
    } finally {
      await mongoose.connection.close();
    }
  }

  // Listar backups disponibles
  listBackups() {
    try {
      const files = fs
        .readdirSync(this.backupDir)
        .filter((file) => file.endsWith(".json"))
        .map((file) => {
          const filePath = path.join(this.backupDir, file);
          const stats = fs.statSync(filePath);
          return {
            fileName: file,
            size: (stats.size / (1024 * 1024)).toFixed(2),
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime,
          };
        })
        .sort((a, b) => b.modifiedAt - a.modifiedAt);

      return files;
    } catch (error) {
      console.error("❌ Error listando backups:", error);
      return [];
    }
  }

  // Eliminar backup
  deleteBackup(fileName) {
    try {
      const filePath = path.join(this.backupDir, fileName);

      if (!fs.existsSync(filePath)) {
        throw new Error(`Archivo de backup no encontrado: ${fileName}`);
      }

      fs.unlinkSync(filePath);
      console.log(`🗑️ Backup eliminado: ${fileName}`);
    } catch (error) {
      console.error("❌ Error eliminando backup:", error);
      throw error;
    }
  }

  // Limpiar backups antiguos
  cleanOldBackups(keepCount = 10) {
    try {
      const backups = this.listBackups();

      if (backups.length <= keepCount) {
        console.log(
          `📦 No hay backups para limpiar. Manteniendo ${backups.length} backups.`
        );
        return;
      }

      const toDelete = backups.slice(keepCount);

      toDelete.forEach((backup) => {
        this.deleteBackup(backup.fileName);
      });

      console.log(
        `🧹 Limpieza completada. Eliminados ${toDelete.length} backups antiguos.`
      );
    } catch (error) {
      console.error("❌ Error limpiando backups:", error);
      throw error;
    }
  }

  // Obtener estadísticas de backup
  getBackupStats() {
    try {
      const backups = this.listBackups();
      const totalSize = backups.reduce(
        (sum, backup) => sum + parseFloat(backup.size),
        0
      );

      return {
        totalBackups: backups.length,
        totalSize: totalSize.toFixed(2),
        oldestBackup:
          backups.length > 0 ? backups[backups.length - 1].createdAt : null,
        newestBackup: backups.length > 0 ? backups[0].createdAt : null,
      };
    } catch (error) {
      console.error("❌ Error obteniendo estadísticas:", error);
      return {
        totalBackups: 0,
        totalSize: "0.00",
        oldestBackup: null,
        newestBackup: null,
      };
    }
  }
}

module.exports = DatabaseBackupAPI;
