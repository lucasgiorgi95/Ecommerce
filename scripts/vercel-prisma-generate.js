#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔧 Generando cliente de Prisma para Vercel...');

// Configurar variables de entorno específicas para Vercel
process.env.PRISMA_CLI_BINARY_TARGETS = 'rhel-openssl-1.0.x';
process.env.PRISMA_GENERATE_SKIP_AUTOINSTALL = 'false';

try {
  // Generar cliente de Prisma con configuración específica
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      PRISMA_CLI_BINARY_TARGETS: 'rhel-openssl-1.0.x'
    }
  });
  
  console.log('✅ Cliente de Prisma generado exitosamente');
  
  // Verificar que el cliente se generó
  const fs = require('fs');
  const path = require('path');
  const clientPath = path.join(__dirname, '..', 'node_modules', '.prisma', 'client');
  
  if (fs.existsSync(clientPath)) {
    console.log('✅ Cliente de Prisma verificado en:', clientPath);
  } else {
    console.warn('⚠️  Cliente de Prisma no encontrado en la ubicación esperada');
  }
  
} catch (error) {
  console.error('❌ Error generando cliente de Prisma:', error.message);
  process.exit(1);
}