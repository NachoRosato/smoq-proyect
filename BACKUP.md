# 📦 Sistema de Backup - SMOQ Proyect

## 🎯 **Descripción General**

El sistema de backup implementado permite gestionar copias de seguridad de la base de datos MongoDB de forma manual y automática, con una interfaz administrativa completa.

## 🚀 **Características Principales**

### ✅ **Funcionalidades Implementadas**

1. **Backup Manual**

   - Creación de backups desde la interfaz admin
   - Compresión automática con gzip
   - Nombres de archivo con timestamp

2. **Backup Automático**

   - Backup diario a las 2:00 AM
   - Backup semanal los domingos a las 3:00 AM
   - Limpieza automática de backups antiguos

3. **Gestión de Backups**

   - Lista de backups disponibles
   - Restauración de backups
   - Eliminación de backups
   - Estadísticas de uso

4. **Interfaz Administrativa**
   - Dashboard completo en `/admin/backup`
   - Estadísticas en tiempo real
   - Acciones con confirmación

## 📁 **Estructura de Archivos**

```
backend/
├── backup.js              # Script principal de backup
├── backup-cron.js         # Sistema de backup automático
├── routes/
│   └── backup.js          # Rutas API para backup
└── backups/               # Directorio de backups (se crea automáticamente)
```

## 🛠️ **Instalación y Configuración**

### **1. Instalar Dependencias**

```bash
cd backend
npm install node-cron cron-parser
```

### **2. Configurar Variables de Entorno**

Asegúrate de que tu archivo `.env` contenga:

```env
MONGODB_URI=mongodb://tu-uri-de-mongodb
```

### **3. Verificar MongoDB Tools**

El sistema requiere que `mongodump` y `mongorestore` estén instalados:

```bash
# En Windows (con Chocolatey)
choco install mongodb

# En macOS (con Homebrew)
brew install mongodb/brew/mongodb-database-tools

# En Linux (Ubuntu/Debian)
sudo apt-get install mongodb-database-tools
```

## 📋 **Comandos Disponibles**

### **Backup Manual**

```bash
# Crear backup manual
npm run backup

# O directamente
node backup.js
```

### **Backup Automático**

```bash
# Iniciar sistema de backup automático
npm run backup-auto

# O directamente
node backup-cron.js
```

## 🔧 **Uso del Sistema**

### **1. Backup Manual desde Terminal**

```bash
cd backend
node backup.js
```

**Salida esperada:**

```
🔄 Iniciando backup de la base de datos...
📁 Archivo: smoq-backup-2024-01-15T10-30-00.gz
✅ Backup completado exitosamente
📦 Archivo guardado: /path/to/backups/smoq-backup-2024-01-15T10-30-00.gz
📏 Tamaño: 2.45 MB
🎉 Backup completado: { fileName: "...", filePath: "...", size: "2.45", timestamp: "..." }
📊 Estadísticas de backup: { totalBackups: 5, totalSize: "12.34", ... }
```

### **2. Backup Automático**

```bash
cd backend
node backup-cron.js
```

**Salida esperada:**

```
🚀 Iniciando sistema de backup automático...
✅ Backup automático configurado:
   📅 Diario: 2:00 AM
   📅 Semanal: Domingo 3:00 AM
🔄 Sistema de backup automático ejecutándose...
💡 Presiona Ctrl+C para detener
```

### **3. Interfaz Web**

Accede a `http://localhost:3000/admin/backup` para:

- ✅ Ver estadísticas de backups
- ✅ Crear backup manual
- ✅ Restaurar backup existente
- ✅ Eliminar backups antiguos
- ✅ Limpiar backups automáticamente

## 🔄 **API Endpoints**

### **GET /api/backup**

Obtiene información de todos los backups

**Headers requeridos:**

```
Authorization: Bearer <token>
```

**Respuesta:**

```json
{
  "success": true,
  "backups": [
    {
      "fileName": "smoq-backup-2024-01-15T10-30-00.gz",
      "size": "2.45",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "modifiedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "stats": {
    "totalBackups": 5,
    "totalSize": "12.34",
    "oldestBackup": "2024-01-10T10:30:00.000Z",
    "newestBackup": "2024-01-15T10:30:00.000Z"
  }
}
```

### **POST /api/backup**

Crea un nuevo backup

**Headers requeridos:**

```
Authorization: Bearer <token>
```

**Respuesta:**

```json
{
  "success": true,
  "message": "Backup creado exitosamente",
  "backup": {
    "fileName": "smoq-backup-2024-01-15T10-30-00.gz",
    "filePath": "/path/to/backup.gz",
    "size": "2.45",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### **POST /api/backup/restore/:fileName**

Restaura un backup específico

**Headers requeridos:**

```
Authorization: Bearer <token>
```

**Respuesta:**

```json
{
  "success": true,
  "message": "Backup restaurado exitosamente"
}
```

### **DELETE /api/backup/:fileName**

Elimina un backup específico

**Headers requeridos:**

```
Authorization: Bearer <token>
```

**Respuesta:**

```json
{
  "success": true,
  "message": "Backup eliminado exitosamente"
}
```

### **POST /api/backup/clean**

Limpia backups antiguos

**Headers requeridos:**

```
Authorization: Bearer <token>
```

**Body:**

```json
{
  "keepCount": 10
}
```

**Respuesta:**

```json
{
  "success": true,
  "message": "Limpieza de backups completada"
}
```

## ⚙️ **Configuración Avanzada**

### **Personalizar Horarios de Backup**

Edita `backend/backup-cron.js`:

```javascript
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
```

### **Personalizar Retención de Backups**

```javascript
// En backup-cron.js
this.backup.cleanOldBackups(7); // Mantener últimos 7 días
this.backup.cleanOldBackups(4); // Mantener últimos 4 semanas
```

### **Cambiar Directorio de Backups**

Edita `backend/backup.js`:

```javascript
constructor() {
  this.backupDir = path.join(__dirname, 'backups'); // Cambiar ruta aquí
  this.ensureBackupDirectory();
}
```

## 🔒 **Seguridad**

### **Protección de Rutas**

- Todas las rutas de backup requieren autenticación
- Verificación de token JWT
- Solo administradores pueden acceder

### **Validaciones**

- Verificación de existencia de archivos
- Confirmación antes de restaurar/eliminar
- Manejo de errores robusto

## 📊 **Monitoreo y Logs**

### **Logs del Sistema**

Los logs se muestran en consola con emojis para fácil identificación:

- 🔄 Proceso iniciado
- ✅ Operación exitosa
- ❌ Error ocurrido
- ⚠️ Advertencia
- 📊 Estadísticas
- 🧹 Limpieza completada

### **Monitoreo de Espacio**

- Tamaño total de backups
- Número de backups
- Fechas de creación
- Limpieza automática

## 🚨 **Solución de Problemas**

### **Error: "mongodump command not found"**

```bash
# Instalar MongoDB Database Tools
# Windows
choco install mongodb

# macOS
brew install mongodb/brew/mongodb-database-tools

# Linux
sudo apt-get install mongodb-database-tools
```

### **Error: "Permission denied"**

```bash
# Verificar permisos del directorio
chmod 755 backend/backups
```

### **Error: "Connection failed"**

- Verificar MONGODB_URI en .env
- Verificar conectividad a MongoDB
- Verificar credenciales

### **Backup muy lento**

- Verificar tamaño de la base de datos
- Considerar backup incremental
- Optimizar red si es remoto

## 🔄 **Mantenimiento**

### **Limpieza Regular**

```bash
# Limpiar backups antiguos manualmente
node -e "const backup = require('./backup'); new backup().cleanOldBackups(10);"
```

### **Verificar Espacio**

```bash
# Verificar tamaño de directorio de backups
du -sh backend/backups/
```

### **Rotación de Logs**

Considerar implementar rotación de logs para el sistema de backup automático.

## 📈 **Mejoras Futuras**

1. **Backup Incremental**

   - Solo respaldar cambios desde último backup
   - Reducir tiempo y espacio

2. **Backup en la Nube**

   - Integración con AWS S3, Google Cloud Storage
   - Sincronización automática

3. **Notificaciones**

   - Email/SMS cuando falla backup
   - Reportes de estado

4. **Compresión Avanzada**

   - Diferentes algoritmos de compresión
   - Configuración de nivel de compresión

5. **Backup Selectivo**
   - Respaldar solo colecciones específicas
   - Excluir datos temporales

## 📞 **Soporte**

Para problemas o consultas sobre el sistema de backup:

1. Revisar logs en consola
2. Verificar configuración de MongoDB
3. Comprobar permisos de archivos
4. Validar conectividad de red

---

**🎉 ¡El sistema de backup está listo para proteger tus datos!**
