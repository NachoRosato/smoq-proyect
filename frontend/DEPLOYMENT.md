# 🚀 Guía de Despliegue en Hostinger

## Preparación del Proyecto

### 1. Build Local (Opcional)

```bash
cd frontend
npm install
npm run build
```

## Métodos de Despliegue en Hostinger

### Método 1: Subida Manual (Recomendado para principiantes)

1. **Accede a tu panel de Hostinger**

   - Ve a tu cuenta de Hostinger
   - Accede al panel de control (hPanel)

2. **Ve al Administrador de Archivos**

   - En el panel, busca "Administrador de Archivos"
   - Navega a la carpeta `public_html`

3. **Sube los archivos**

   - Sube todo el contenido de la carpeta `frontend` a `public_html`
   - Asegúrate de que el archivo `.htaccess` esté en la raíz

4. **Configura el dominio**
   - Ve a "Dominios" en el panel
   - Configura tu dominio para que apunte a `public_html`

### Método 2: Git + Deploy Automático

1. **Conecta tu repositorio**

   - En Hostinger, ve a "Git"
   - Conecta tu repositorio de GitHub/GitLab
   - Configura el branch principal (main/master)

2. **Configura el build**
   - Establece el comando de build: `npm run build`
   - Directorio de salida: `out` o `.next`

### Método 3: FTP/SFTP

1. **Configura un cliente FTP**

   - Usa FileZilla, WinSCP, o similar
   - Conecta con los datos de tu hosting

2. **Sube los archivos**
   - Sube todo el contenido de `frontend` a `public_html`

## Configuración Post-Despliegue

### 1. Verificar archivos críticos

- ✅ `index.html` en la raíz
- ✅ `.htaccess` configurado
- ✅ Archivos estáticos en `/static`
- ✅ Imágenes en `/public`

### 2. Configurar variables de entorno

Si tu app usa variables de entorno, configúralas en:

- Panel de Hostinger → Variables de Entorno
- O en el archivo `.env.local`

### 3. Configurar SSL

- Ve a "SSL" en el panel
- Activa el certificado SSL gratuito
- Configura redirección HTTPS

## Solución de Problemas

### Error 404 en rutas

- Verifica que `.htaccess` esté configurado correctamente
- Asegúrate de que `RewriteEngine On` esté presente

### Imágenes no cargan

- Verifica las rutas en `next.config.js`
- Asegúrate de que las imágenes estén en `/public`

### Errores de CORS

- Configura los headers en `.htaccess`
- Verifica las configuraciones de dominio

## Optimización

### 1. Caché

- El `.htaccess` ya incluye configuraciones de caché
- Verifica que funcionen correctamente

### 2. Compresión

- GZIP está configurado en `.htaccess`
- Verifica en las herramientas de desarrollador

### 3. CDN (Opcional)

- Considera usar Cloudflare para mejor rendimiento
- Configura el CDN en el panel de Hostinger

## Monitoreo

### 1. Analytics

- Configura Google Analytics
- O usa las herramientas de Hostinger

### 2. Logs

- Revisa los logs de error en el panel
- Configura alertas si es necesario

## Contacto de Soporte

Si tienes problemas:

1. Revisa esta guía
2. Consulta la documentación de Hostinger
3. Contacta al soporte técnico de Hostinger

---

**¡Tu aplicación Next.js debería estar funcionando en Hostinger!** 🎉
