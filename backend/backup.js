const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

class DatabaseBackup {
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

  // Verificar si mongodump está disponible
  async checkMongoTools() {
    return new Promise((resolve, reject) => {
      exec("mongodump --version", (error, stdout, stderr) => {
        if (error) {
          console.error("❌ mongodump no está disponible:", error.message);
          reject(new Error("mongodump no está instalado o no está en el PATH"));
          return;
        }
        console.log("✅ mongodump está disponible");
        resolve(true);
      });
    });
  }

  // Generar nombre de archivo con timestamp
  generateBackupFileName() {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, -5);
    return `smoq-backup-${timestamp}.gz`;
  }

  // Hacer backup completo de la base de datos
  async createBackup() {
    try {
      // Verificar que mongodump esté disponible
      await this.checkMongoTools();

      return new Promise((resolve, reject) => {
        const fileName = this.generateBackupFileName();
        const filePath = path.join(this.backupDir, fileName);

        // Comando para hacer backup
        const mongoUri = process.env.MONGODB_URI;

        if (!mongoUri) {
          reject(new Error("MONGODB_URI no está configurada"));
          return;
        }

        const dbName = mongoUri.split("/").pop().split("?")[0];

        const command = `mongodump --uri="${mongoUri}" --archive="${filePath}" --gzip`;

        console.log("🔄 Iniciando backup de la base de datos...");
        console.log(`📁 Archivo: ${fileName}`);
        console.log(
          `🔗 URI: ${mongoUri.replace(/\/\/[^:]+:[^@]+@/, "//***:***@")}`
        );

        exec(command, { timeout: 300000 }, (error, stdout, stderr) => {
          if (error) {
            console.error("❌ Error durante el backup:", error);
            console.error("❌ stderr:", stderr);
            reject(new Error(`Error en mongodump: ${error.message}`));
            return;
          }

          if (stderr && !stderr.includes("writing")) {
            console.warn("⚠️ Advertencias durante el backup:", stderr);
          }

          // Verificar que el archivo se creó
          if (!fs.existsSync(filePath)) {
            reject(new Error("El archivo de backup no se creó"));
            return;
          }

          console.log("✅ Backup completado exitosamente");
          console.log(`📦 Archivo guardado: ${filePath}`);

          // Obtener tamaño del archivo
          const stats = fs.statSync(filePath);
          const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
          console.log(`📏 Tamaño: ${fileSizeInMB} MB`);

          resolve({
            fileName,
            filePath,
            size: fileSizeInMB,
            timestamp: new Date().toISOString(),
          });
        });
      });
    } catch (error) {
      console.error("❌ Error en createBackup:", error);
      throw error;
    }
  }

  // Restaurar backup
  async restoreBackup(fileName) {
    try {
      // Verificar que mongorestore esté disponible
      await this.checkMongoTools();

      return new Promise((resolve, reject) => {
        const filePath = path.join(this.backupDir, fileName);

        if (!fs.existsSync(filePath)) {
          reject(new Error(`Archivo de backup no encontrado: ${fileName}`));
          return;
        }

        const mongoUri = process.env.MONGODB_URI;
        const command = `mongorestore --uri="${mongoUri}" --archive="${filePath}" --gzip --drop`;

        console.log("🔄 Iniciando restauración...");
        console.log(`📁 Archivo: ${fileName}`);

        exec(command, { timeout: 300000 }, (error, stdout, stderr) => {
          if (error) {
            console.error("❌ Error durante la restauración:", error);
            console.error("❌ stderr:", stderr);
            reject(new Error(`Error en mongorestore: ${error.message}`));
            return;
          }

          if (stderr && !stderr.includes("restoring")) {
            console.warn("⚠️ Advertencias durante la restauración:", stderr);
          }

          console.log("✅ Restauración completada exitosamente");
          resolve({ success: true });
        });
      });
    } catch (error) {
      console.error("❌ Error en restoreBackup:", error);
      throw error;
    }
  }

  // Listar backups disponibles
  listBackups() {
    try {
      const files = fs
        .readdirSync(this.backupDir)
        .filter((file) => file.endsWith(".gz"))
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

  // Eliminar backup antiguo
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

  // Limpiar backups antiguos (mantener solo los últimos N)
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

// Función principal para ejecutar backup
async function runBackup() {
  const backup = new DatabaseBackup();

  try {
    const result = await backup.createBackup();
    console.log("🎉 Backup completado:", result);

    // Limpiar backups antiguos (mantener solo los últimos 10)
    backup.cleanOldBackups(10);

    // Mostrar estadísticas
    const stats = backup.getBackupStats();
    console.log("📊 Estadísticas de backup:", stats);
  } catch (error) {
    console.error("💥 Error en el backup:", error);
    process.exit(1);
  }
}

// Si se ejecuta directamente
if (require.main === module) {
  runBackup();
}

module.exports = DatabaseBackup;
