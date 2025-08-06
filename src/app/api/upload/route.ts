import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó archivo' },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido. Solo se permiten: JPG, PNG, WebP' },
        { status: 400 }
      );
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'El archivo es demasiado grande (máximo 10MB)' },
        { status: 400 }
      );
    }

    // Verificar si estamos en producción con Vercel
    const isVercelProduction = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
    
    if (isVercelProduction) {
      // Intentar usar Vercel Blob Storage en producción
      try {
        const { VercelBlobService } = await import('@/lib/vercel-blob');
        const imageUrl = await VercelBlobService.uploadImage(file);
        
        console.log('✅ Imagen subida exitosamente a Vercel Blob:', imageUrl);
        
        return NextResponse.json({
          url: imageUrl,
          filename: file.name,
          size: file.size,
          type: file.type
        });
      } catch (blobError) {
        console.error('❌ Error with Vercel Blob Storage:', blobError);
        
        // En producción, si Vercel Blob falla, usar placeholder
        const placeholderUrl = `/api/placeholder?width=300&height=300&text=${encodeURIComponent(file.name.split('.')[0] || 'Imagen')}`;
        
        return NextResponse.json({
          url: placeholderUrl,
          filename: 'placeholder.svg',
          size: file.size,
          type: 'image/svg+xml',
          warning: 'Imagen guardada como placeholder debido a error en Vercel Blob'
        });
      }
    } else {
      // En desarrollo, usar sistema local o placeholder
      try {
        const { uploadImageLocally } = await import('@/lib/fileUpload');
        const result = await uploadImageLocally(file);
        
        console.log('✅ Imagen subida localmente:', result.url);
        
        return NextResponse.json({
          url: result.url,
          filename: result.filename,
          size: result.size,
          type: result.type
        });
      } catch (localError) {
        console.error('❌ Error with local upload:', localError);
        
        // Fallback a placeholder en desarrollo
        const placeholderUrl = `/api/placeholder?width=300&height=300&text=${encodeURIComponent(file.name.split('.')[0] || 'Imagen')}`;
        
        return NextResponse.json({
          url: placeholderUrl,
          filename: 'placeholder.svg',
          size: file.size,
          type: 'image/svg+xml',
          warning: 'Imagen guardada como placeholder debido a error en subida local'
        });
      }
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Error al subir imagen' },
      { status: 500 }
    );
  }
}