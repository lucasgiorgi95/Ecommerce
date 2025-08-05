#!/bin/bash

# Script de build para Vercel que asegura que Prisma se genere correctamente

echo "🔧 Generando cliente de Prisma..."
npx prisma generate

echo "🏗️ Construyendo aplicación Next.js..."
npx next build

echo "✅ Build completado exitosamente"