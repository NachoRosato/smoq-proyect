npm# SMOQ Tienda - Monorepo

Monorepo para tienda sin pagos con Next.js (frontend) y Node.js (backend), usando MongoDB.

## 🚀 Características

- **Frontend**: Next.js + Tailwind CSS (100% responsive)
- **Backend**: Node.js + Express + MongoDB
- **Carrito**: Estado global persistente en localStorage
- **Admin**: Panel de administración con CRUD de productos
- **Pedidos**: Envío por email usando Nodemailer y SMTP real
- **Validaciones**: Formularios con validaciones en tiempo real
- **Stock por Gusto**: Gestión individual de stock para cada sabor/gusto de producto

## 📁 Estructura

```
SMOQ-Proyect/
├── frontend/             -> Next.js + Tailwind
├── backend/              -> Node.js + Express + MongoDB
├── .env                  -> Variables de entorno
└── package.json          -> Scripts del monorepo
```

## 🛠️ Instalación

1. **Clonar el repositorio**

```bash
git clone <url-del-repositorio>
cd SMOQ-Proyect
```

2. **Instalar dependencias**

```bash
npm run install:all
```

3. **Configurar variables de entorno**

```bash
# Crear archivo .env en la raíz
cp .env.example .env
# Editar .env con tus credenciales
```

4. **Ejecutar migración de stock por gusto (si es necesario)**

```bash
cd backend
node migrate-stock-por-gusto.js
```

5. **Ejecutar en desarrollo**

```bash
npm run dev
```

## 🔧 Configuración

### Variables de entorno (.env)

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/smoq-tienda

# JWT
JWT_SECRET=tu-secreto-jwt-super-seguro

# SMTP (Hostinger)
SMTP_HOST=smtp.hostinger.com
SMTP_USER=tu-email@dominio.com
SMTP_PASS=tu-contraseña-smtp

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 📱 Uso

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Admin**: http://localhost:3000/admin/login

## 🛒 Flujo de Carrito

1. **Paso 1**: Selección de productos
2. **Paso 2**: Formulario de contacto (validaciones)
3. **Paso 3**: Confirmación y envío por email

## 🍦 Stock por Gusto

### Nueva Funcionalidad

- **Stock Individual**: Cada gusto/sabor de un producto tiene su propio stock
- **Validación**: Los productos con gustos deben tener stock definido para cada gusto
- **Interfaz Actualizada**: El frontend muestra el stock disponible según el gusto seleccionado
- **Admin Mejorado**: Panel de administración permite definir stock individual por gusto

### Migración

Si tienes productos existentes con gustos, ejecuta el script de migración:

```bash
cd backend
node migrate-stock-por-gusto.js
```

Este script asignará el stock general a cada gusto existente.

## 📧 Envío de Pedidos

Los pedidos se envían automáticamente por email usando Nodemailer con SMTP real de Hostinger.

## 🔐 Admin

- Login con JWT
- CRUD completo de productos
- Gestión de stock por gusto
- Protección de rutas con middleware
  #   s m o q - p r o y e c t 
   
   #   s m o q - p r o y e c t 
   
   
