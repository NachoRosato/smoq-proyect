const cron = require("node-cron");
const DatabaseBackup = require("./backup");
const path = require("path");

class AutomatedBackup {
  constructor() {
    this.backup = new DatabaseBackup();
    this.isRunning = false;
  }

  // Iniciar backup automático
  startAutomatedBackup() {
    console.log("🚀 Iniciando sistema de backup automático...");

    // Backup diario a las 2:00 AM
    cron.schedule(
      "0 2 * * *",
      () => {
        this.runDailyBackup();
      },
      {
        scheduled: true,
        timezone: "America/Argentina/Buenos_Aires",
      }
    );

    // Backup semanal los domingos a las 3:00 AM
    cron.schedule(
      "0 3 * * 0",
      () => {
        this.runWeeklyBackup();
      },
      {
        scheduled: true,
        timezone: "America/Argentina/Buenos_Aires",
      }
    );

    console.log("✅ Backup automático configurado:");
    console.log("   📅 Diario: 2:00 AM");
    console.log("   📅 Semanal: Domingo 3:00 AM");
  }

  // Backup diario
  async runDailyBackup() {
    if (this.isRunning) {
      console.log("⏳ Backup ya en progreso, saltando...");
      return;
    }

    this.isRunning = true;
    console.log("🌅 Iniciando backup diario...");

    try {
      const result = await this.backup.createBackup();
      console.log("✅ Backup diario completado:", result);

      // Limpiar backups antiguos (mantener últimos 7 días)
      this.backup.cleanOldBackups(7);
    } catch (error) {
      console.error("❌ Error en backup diario:", error);
    } finally {
      this.isRunning = false;
    }
  }

  // Backup semanal
  async runWeeklyBackup() {
    if (this.isRunning) {
      console.log("⏳ Backup ya en progreso, saltando...");
      return;
    }

    this.isRunning = true;
    console.log("📅 Iniciando backup semanal...");

    try {
      const result = await this.backup.createBackup();
      console.log("✅ Backup semanal completado:", result);

      // Limpiar backups antiguos (mantener últimos 4 semanas)
      this.backup.cleanOldBackups(4);
    } catch (error) {
      console.error("❌ Error en backup semanal:", error);
    } finally {
      this.isRunning = false;
    }
  }

  // Backup manual
  async runManualBackup() {
    if (this.isRunning) {
      console.log("⏳ Backup ya en progreso, esperando...");
      return;
    }

    this.isRunning = true;
    console.log("🔄 Iniciando backup manual...");

    try {
      const result = await this.backup.createBackup();
      console.log("✅ Backup manual completado:", result);
    } catch (error) {
      console.error("❌ Error en backup manual:", error);
    } finally {
      this.isRunning = false;
    }
  }

  // Obtener estado del sistema
  getStatus() {
    const stats = this.backup.getBackupStats();
    return {
      isRunning: this.isRunning,
      stats,
      nextDailyBackup: this.getNextCronTime("0 2 * * *"),
      nextWeeklyBackup: this.getNextCronTime("0 3 * * 0"),
    };
  }

  // Obtener próxima ejecución de cron
  getNextCronTime(cronExpression) {
    const parser = require("cron-parser");
    const interval = parser.parseExpression(cronExpression, {
      tz: "America/Argentina/Buenos_Aires",
    });
    return interval.next().toDate();
  }
}

// Si se ejecuta directamente
if (require.main === module) {
  const automatedBackup = new AutomatedBackup();

  // Iniciar backup automático
  automatedBackup.startAutomatedBackup();

  // Mantener el proceso vivo
  console.log("🔄 Sistema de backup automático ejecutándose...");
  console.log("💡 Presiona Ctrl+C para detener");

  process.on("SIGINT", () => {
    console.log("\n🛑 Deteniendo sistema de backup automático...");
    process.exit(0);
  });
}

module.exports = AutomatedBackup;
