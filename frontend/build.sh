#!/bin/bash

echo "🚀 Iniciando build para producción..."

# Limpiar builds anteriores
echo "🧹 Limpiando builds anteriores..."
rm -rf .next
rm -rf out

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Build para producción
echo "🔨 Construyendo aplicación..."
npm run build

# Exportar para hosting estático (opcional)
echo "📤 Exportando archivos estáticos..."
npm run export

echo "✅ Build completado exitosamente!"
echo "📁 Los archivos están listos en la carpeta 'out'"
echo "🌐 Sube el contenido de 'out' a tu hosting" 