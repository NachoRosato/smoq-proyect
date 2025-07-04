@echo off
echo ========================================
echo Instalando SMOQ Tienda - Monorepo
echo ========================================

echo.
echo 1. Instalando dependencias del monorepo...
npm install

echo.
echo 2. Instalando dependencias del frontend...
cd frontend
npm install
cd ..

echo.
echo 3. Instalando dependencias del backend...
cd backend
npm install
cd ..

echo.
echo 4. Creando archivo .env...
if not exist .env (
    copy env.example .env
    echo Archivo .env creado. Por favor edítalo con tus credenciales.
) else (
    echo El archivo .env ya existe.
)

echo.
echo ========================================
echo Instalación completada!
echo ========================================
echo.
echo Para ejecutar el proyecto:
echo 1. Edita el archivo .env con tus credenciales
echo 2. Ejecuta: npm run dev
echo.
echo URLs:
echo - Frontend: http://localhost:3000
echo - Backend: http://localhost:3001
echo - Admin: http://localhost:3000/admin/login
echo.
pause 