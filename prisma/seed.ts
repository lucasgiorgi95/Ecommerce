import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Limpiar datos existentes
  await prisma.product.deleteMany()

  // Crear productos de ejemplo
  const products = [
    {
      name: 'Camiseta Premium',
      description: 'Camiseta de algodón orgánico de alta calidad, perfecta para uso diario',
      price: 29.99,
      category: "men's clothing",
      images: JSON.stringify(['https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg']),
      status: 'published'
    },
    {
      name: 'Pantalón Casual',
      description: 'Pantalón cómodo para uso diario, confeccionado con materiales de primera calidad',
      price: 49.99,
      category: "men's clothing",
      images: JSON.stringify(['https://fakestoreapi.com/img/71YXzeOuslL._AC_UY879_.jpg']),
      status: 'published'
    },
    {
      name: 'Vestido Elegante',
      description: 'Vestido elegante para ocasiones especiales, diseño moderno y sofisticado',
      price: 79.99,
      category: "women's clothing",
      images: JSON.stringify(['https://fakestoreapi.com/img/51Y5NI-I5jL._AC_UX679_.jpg']),
      status: 'published'
    },
    {
      name: 'Collar de Plata',
      description: 'Collar elegante de plata 925 con colgante, perfecto para cualquier ocasión',
      price: 89.99,
      category: 'jewelery',
      images: JSON.stringify(['https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_QL65_ML3_.jpg']),
      status: 'paused'
    },
    {
      name: 'Auriculares Bluetooth',
      description: 'Auriculares inalámbricos con cancelación de ruido y excelente calidad de sonido',
      price: 159.99,
      category: 'electronics',
      images: JSON.stringify(['https://fakestoreapi.com/img/51UDEzMJVpL._AC_UL640_QL65_ML3_.jpg']),
      status: 'published'
    }
  ]

  for (const product of products) {
    await prisma.product.create({
      data: product
    })
  }

  console.log('✅ Base de datos inicializada con productos de ejemplo')
}

main()
  .catch((e) => {
    console.error('❌ Error inicializando la base de datos:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })