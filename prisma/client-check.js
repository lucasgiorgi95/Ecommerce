// Script para verificar que el cliente de Prisma esté disponible
const fs = require('fs');
const path = require('path');

const clientPath = path.join(__dirname, '..', 'node_modules', '.prisma', 'client');

if (!fs.existsSync(clientPath)) {
  console.log('❌ Cliente de Prisma no encontrado, generando...');
  const { execSync } = require('child_process');
  
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Cliente de Prisma generado exitosamente');
  } catch (error) {
    console.error('❌ Error generando cliente de Prisma:', error);
    process.exit(1);
  }
} else {
  console.log('✅ Cliente de Prisma ya existe');
}