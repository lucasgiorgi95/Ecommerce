#!/bin/bash

echo "🚀 Iniciando build para Vercel..."

# Verificar que Prisma esté instalado
echo "📦 Verificando instalación de Prisma..."
if ! command -v prisma &> /dev/null; then
    echo "⚠️  Prisma CLI no encontrado, instalando..."
    npm install -g prisma
fi

# Generar cliente de Prisma
echo "🔧 Generando cliente de Prisma..."
npx prisma generate

# Verificar que el cliente se generó correctamente
if [ -d "node_modules/.prisma/client" ]; then
    echo "✅ Cliente de Prisma generado exitosamente"
else
    echo "❌ Error: Cliente de Prisma no se generó correctamente"
    exit 1
fi

# Ejecutar build de Next.js
echo "🏗️  Construyendo aplicación Next.js..."
npx next build

echo "✅ Build completado exitosamente"