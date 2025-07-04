# 🚀 Guía de Configuración - SMOQ Tienda

## 📋 Requisitos Previos

- **Node.js** (versión 16 o superior)
- **npm** o **yarn**
- **MongoDB** (local o Atlas)
- **Cuenta de email** con SMTP (Hostinger, Gmail, etc.)

## 🛠️ Instalación Rápida

### Opción 1: Script Automático (Windows)

```bash
# Ejecutar el script de instalación
install.bat
```

### Opción 2: Instalación Manual

```bash
# 1. Instalar dependencias del monorepo
npm install

# 2. Instalar dependencias del frontend
cd frontend && npm install && cd ..

# 3. Instalar dependencias del backend
cd backend && npm install && cd ..
```

## ⚙️ Configuración

### 1. Variables de Entorno

Copia el archivo de ejemplo y edítalo:

```bash
cp env.example .env
```

Edita `.env` con tus credenciales:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/smoq-tienda

# JWT (genera una clave segura)
JWT_SECRET=tu-secreto-jwt-super-seguro-aqui

# SMTP (Hostinger)
SMTP_HOST=smtp.hostinger.com
SMTP_USER=tu-email@dominio.com
SMTP_PASS=tu-contraseña-smtp

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001

# Puerto del backend
PORT=3001
```

### 2. Configuración de MongoDB

#### Opción A: MongoDB Local

1. Instala MongoDB en tu sistema
2. Inicia el servicio de MongoDB
3. Usa: `MONGODB_URI=mongodb://localhost:27017/smoq-tienda`

#### Opción B: MongoDB Atlas

1. Crea una cuenta en [MongoDB Atlas](https://cloud.mongodb.com)
2. Crea un cluster gratuito
3. Obtén la URL de conexión
4. Usa: `MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/smoq-tienda`

### 3. Configuración de Email

#### Hostinger (Recomendado)

```env
SMTP_HOST=smtp.hostinger.com
SMTP_USER=tu-email@tudominio.com
SMTP_PASS=tu-contraseña-de-aplicación
```

#### Gmail

```env
SMTP_HOST=smtp.gmail.com
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña-de-aplicación
```

**Nota:** Para Gmail, necesitas generar una "Contraseña de aplicación" en la configuración de seguridad.

## 🚀 Ejecución

### Desarrollo

```bash
# Ejecutar frontend y backend simultáneamente
npm run dev
```

### Producción

```bash
# Construir frontend
npm run build

# Ejecutar backend
npm start
```

## 📱 URLs de Acceso

- **Frontend (Tienda)**: http://localhost:3000
- **Backend (API)**: http://localhost:3001
- **Admin Panel**: http://localhost:3000/admin/login

## 👤 Configuración del Admin

### Crear Usuario Admin

1. Accede a MongoDB (Compass o terminal)
2. Ve a la colección `usuarios`
3. Inserta un documento:

```json
{
  "nombre": "Administrador",
  "email": "admin@tudominio.com",
  "password": "tu-contraseña-segura",
  "rol": "admin",
  "activo": true
}
```

**Nota:** La contraseña se hasheará automáticamente.

### Acceder al Admin

1. Ve a http://localhost:3000/admin/login
2. Usa las credenciales que creaste
3. Gestiona productos desde el dashboard

## 🛒 Funcionalidades

### Frontend

- ✅ Catálogo de productos responsive
- ✅ Carrito con persistencia en localStorage
- ✅ Búsqueda y filtros
- ✅ Formulario de contacto con validaciones
- ✅ Envío de pedidos por email

### Backend

- ✅ API REST con Express
- ✅ Autenticación JWT
- ✅ CRUD de productos
- ✅ Envío de emails con Nodemailer
- ✅ Base de datos MongoDB

### Admin

- ✅ Login seguro
- ✅ Dashboard de productos
- ✅ Crear, editar, eliminar productos
- ✅ Gestión de pedidos

## 🔧 Personalización

### Cambiar Colores

Edita `frontend/tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#eff6ff',
        500: '#3b82f6', // Color principal
        600: '#2563eb',
        700: '#1d4ed8',
      },
    },
  },
},
```

### Cambiar Logo

Reemplaza el logo en `frontend/components/Navbar.tsx`

### Modificar Email Template

Edita el template en `backend/routes/pedidos.js`

## 🐛 Solución de Problemas

### Error de Conexión MongoDB

- Verifica que MongoDB esté ejecutándose
- Revisa la URL de conexión en `.env`
- Asegúrate de que la base de datos sea accesible

### Error de Email

- Verifica las credenciales SMTP
- Asegúrate de que el puerto 465 esté abierto
- Para Gmail, usa contraseña de aplicación

### Error de CORS

- Verifica que `NEXT_PUBLIC_API_URL` esté correcto
- Asegúrate de que el backend esté ejecutándose

### Error de JWT

- Genera un nuevo `JWT_SECRET` seguro
- Limpia el localStorage del navegador

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs del backend en la consola
2. Verifica la configuración de `.env`
3. Asegúrate de que todas las dependencias estén instaladas

## 🚀 Despliegue

### Frontend (Vercel)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Deploy automático

### Backend (Railway/Render)

1. Sube el código a GitHub
2. Conecta con Railway o Render
3. Configura variables de entorno
4. Deploy

### Base de Datos

- Usa MongoDB Atlas para producción
- Configura IP whitelist
- Usa credenciales seguras
