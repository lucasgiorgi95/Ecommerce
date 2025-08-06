import { put, list } from '@vercel/blob';

async function testVercelBlob() {
  console.log('🧪 Probando Vercel Blob Storage...');

  try {
    // Verificar variables de entorno
    console.log('📋 Variables de entorno:');
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- VERCEL:', process.env.VERCEL);
    console.log('- BLOB_READ_WRITE_TOKEN:', process.env.BLOB_READ_WRITE_TOKEN ? 'Configurado' : 'No configurado');

    // Crear un archivo de prueba
    const testContent = 'Test file for Vercel Blob';
    const testFile = new File([testContent], 'test.txt', { type: 'text/plain' });

    console.log('\n📤 Intentando subir archivo de prueba...');
    
    const blob = await put('test/test-file.txt', testFile, {
      access: 'public',
    });

    console.log('✅ Archivo subido exitosamente!');
    console.log('- URL:', blob.url);
    console.log('- Tamaño:', blob.size);

    // Listar archivos
    console.log('\n📋 Listando archivos en Vercel Blob...');
    const { blobs } = await list();
    
    console.log(`📊 Total de archivos: ${blobs.length}`);
    blobs.forEach((blob, index) => {
      console.log(`${index + 1}. ${blob.pathname} (${blob.size} bytes)`);
    });

  } catch (error) {
    console.error('❌ Error probando Vercel Blob:', error);
    
    if (error instanceof Error) {
      console.error('- Mensaje:', error.message);
      console.error('- Stack:', error.stack);
    }
  }
}

testVercelBlob().catch(console.error);