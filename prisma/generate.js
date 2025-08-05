const { execSync } = require('child_process');

console.log('🔧 Generando cliente de Prisma...');

try {
  // Generar el cliente de Prisma
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Cliente de Prisma generado exitosamente');
} catch (error) {
  console.error('❌ Error generando cliente de Prisma:', error);
  process.exit(1);
}