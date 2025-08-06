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

    // Detectar si estamos en Vercel (producción) o desarrollo local
    const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      // Usar Vercel Blob en producción
      try {
        const { put } = await import('@vercel/blob');
        
        // Generar nombre único
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const extension = file.name.split('.').pop() || 'jpg';
        const fileName = `products/${timestamp}-${randomString}.${extension}`;

        // Subir a Vercel Blob Storage
        const blob = await put(fileName, file, {
          access: 'public',
        });

        return NextResponse.json({
          url: blob.url,
          filename: fileName,
          size: file.size,
          type: file.type
        });
      } catch (blobError) {
        console.error('Error with Vercel Blob, falling back to placeholder:', blobError);
        // Fallback a placeholder si Vercel Blob falla
        return NextResponse.json({
          url: `/api/placeholder?width=300&height=300&text=${encodeURIComponent('Imagen subida')}`,
          filename: 'placeholder.svg',
          size: file.size,
          type: 'image/svg+xml'
        });
      }
    } else {
      // En desarrollo, usar sistema local o placeholder
      try {
        const { uploadImageLocally } = await import('@/lib/fileUpload');
        const result = await uploadImageLocally(file);
        
        return NextResponse.json({
          url: result.url,
          filename: result.filename,
          size: result.size,
          type: result.type
        });
      } catch (localError) {
        console.error('Error with local upload, using placeholder:', localError);
        // Fallback a placeholder
        return NextResponse.json({
          url: `/api/placeholder?width=300&height=300&text=${encodeURIComponent('Imagen subida')}`,
          filename: 'placeholder.svg',
          size: file.size,
          type: 'image/svg+xml'
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