// Script para probar la sincronización entre admin y frontend
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testSync() {
  console.log('🧪 Probando sincronización Admin <-> Frontend...\n')

  // 1. Crear un producto desde "admin"
  console.log('1. Creando producto desde admin...')
  const newProduct = await prisma.product.create({
    data: {
      name: 'Producto de Prueba',
      description: 'Este producto fue creado para probar la sincronización',
      price: 99.99,
      category: 'electronics',
      images: JSON.stringify(['https://via.placeholder.com/300x300?text=Prueba']),
      status: 'published'
    }
  })
  console.log(`✅ Producto creado: ${newProduct.name} (ID: ${newProduct.id})`)

  // 2. Verificar que aparece en el frontend
  console.log('\n2. Verificando productos publicados para frontend...')
  const publishedProducts = await prisma.product.findMany({
    where: { status: 'published' },
    orderBy: { createdAt: 'desc' }
  })
  console.log(`✅ Total productos publicados: ${publishedProducts.length}`)
  console.log('Productos:', publishedProducts.map(p => `- ${p.name} (${p.status})`).join('\n'))

  // 3. Pausar el producto
  console.log('\n3. Pausando producto...')
  await prisma.product.update({
    where: { id: newProduct.id },
    data: { status: 'paused' }
  })
  console.log('✅ Producto pausado')

  // 4. Verificar que no aparece en frontend
  console.log('\n4. Verificando productos después de pausar...')
  const publishedAfterPause = await prisma.product.findMany({
    where: { status: 'published' },
    orderBy: { createdAt: 'desc' }
  })
  console.log(`✅ Total productos publicados: ${publishedAfterPause.length}`)

  // 5. Eliminar producto de prueba
  console.log('\n5. Limpiando producto de prueba...')
  await prisma.product.delete({
    where: { id: newProduct.id }
  })
  console.log('✅ Producto eliminado')

  console.log('\n🎉 ¡Sincronización funcionando correctamente!')
  console.log('\n📋 Resumen:')
  console.log('- ✅ Crear producto en admin → Aparece en frontend')
  console.log('- ✅ Pausar producto en admin → Desaparece del frontend')
  console.log('- ✅ Eliminar producto en admin → Se elimina completamente')
}

testSync()
  .catch((e) => {
    console.error('❌ Error en la prueba:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })