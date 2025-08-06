import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addTestProduct() {
  console.log('🧪 Agregando producto de prueba...');

  try {
    const testProduct = await prisma.product.create({
      data: {
        name: 'Producto de Prueba',
        description: 'Este es un producto de prueba para verificar el funcionamiento de las imágenes',
        price: 29.99,
        category: "men's clothing",
        stock: 10,
        images: JSON.stringify(['/api/placeholder?width=300&height=300&text=Producto+de+Prueba']),
        status: 'published'
      }
    });

    console.log('✅ Producto de prueba creado exitosamente:');
    console.log('- ID:', testProduct.id);
    console.log('- Nombre:', testProduct.name);
    console.log('- Precio:', testProduct.price);
    console.log('- Imagen:', JSON.parse(testProduct.images)[0]);

  } catch (error) {
    console.error('❌ Error creando producto de prueba:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestProduct().catch(console.error);