const express = require("express");
const DatabaseBackup = require("../backup");
const DatabaseBackupAPI = require("../backup-api");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// Función para detectar qué método de backup usar
async function getBackupMethod() {
  try {
    const backup = new DatabaseBackup();
    await backup.checkMongoTools();
    return backup;
  } catch (error) {
    console.log("⚠️ mongodump no disponible, usando método API");
    return new DatabaseBackupAPI();
  }
}

// GET /backup - Obtener información de backups
router.get("/", verifyToken, async (req, res) => {
  try {
    console.log("🔍 Usuario autenticado:", req.usuario.email);
    const backup = await getBackupMethod();
    const backups = backup.listBackups();
    const stats = backup.getBackupStats();

    res.json({
      success: true,
      backups,
      stats,
      method: backup.constructor.name,
    });
  } catch (error) {
    console.error("Error obteniendo información de backups:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    });
  }
});

// POST /backup - Crear backup manual
router.post("/", verifyToken, async (req, res) => {
  try {
    console.log("🔍 Usuario autenticado:", req.usuario.email);
    const backup = await getBackupMethod();
    const result = await backup.createBackup();

    res.json({
      success: true,
      message: "Backup creado exitosamente",
      backup: result,
      method: backup.constructor.name,
    });
  } catch (error) {
    console.error("Error creando backup:", error);
    res.status(500).json({
      success: false,
      error: `Error al crear backup: ${error.message}`,
    });
  }
});

// POST /backup/restore/:fileName - Restaurar backup
router.post("/restore/:fileName", verifyToken, async (req, res) => {
  try {
    const { fileName } = req.params;
    console.log("🔍 Usuario autenticado:", req.usuario.email);
    const backup = await getBackupMethod();

    await backup.restoreBackup(fileName);

    res.json({
      success: true,
      message: "Backup restaurado exitosamente",
      method: backup.constructor.name,
    });
  } catch (error) {
    console.error("Error restaurando backup:", error);
    res.status(500).json({
      success: false,
      error: `Error al restaurar backup: ${error.message}`,
    });
  }
});

// DELETE /backup/:fileName - Eliminar backup
router.delete("/:fileName", verifyToken, async (req, res) => {
  try {
    const { fileName } = req.params;
    console.log("🔍 Usuario autenticado:", req.usuario.email);
    const backup = await getBackupMethod();

    backup.deleteBackup(fileName);

    res.json({
      success: true,
      message: "Backup eliminado exitosamente",
      method: backup.constructor.name,
    });
  } catch (error) {
    console.error("Error eliminando backup:", error);
    res.status(500).json({
      success: false,
      error: `Error al eliminar backup: ${error.message}`,
    });
  }
});

// POST /backup/clean - Limpiar backups antiguos
router.post("/clean", verifyToken, async (req, res) => {
  try {
    const { keepCount = 10 } = req.body;
    console.log("🔍 Usuario autenticado:", req.usuario.email);
    const backup = await getBackupMethod();

    backup.cleanOldBackups(keepCount);

    res.json({
      success: true,
      message: "Limpieza de backups completada",
      method: backup.constructor.name,
    });
  } catch (error) {
    console.error("Error limpiando backups:", error);
    res.status(500).json({
      success: false,
      error: `Error al limpiar backups: ${error.message}`,
    });
  }
});

// GET /backup/download/:fileName - Descargar backup
router.get("/download/:fileName", verifyToken, async (req, res) => {
  try {
    const { fileName } = req.params;
    console.log("🔍 Usuario autenticado:", req.usuario.email);

    const backup = await getBackupMethod();
    const filePath = path.join(backup.backupDir, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: "Archivo de backup no encontrado",
      });
    }

    // Configurar headers para descarga
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    // Enviar archivo
    res.sendFile(filePath);
  } catch (error) {
    console.error("Error descargando backup:", error);
    res.status(500).json({
      success: false,
      error: `Error al descargar backup: ${error.message}`,
    });
  }
});

module.exports = router;
