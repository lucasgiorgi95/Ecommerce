import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Validaciones de seguridad
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        // Validar tipo de archivo
        if (clientPayload && typeof clientPayload === 'object' && 'type' in clientPayload) {
          const fileType = clientPayload.type as string;
          if (!allowedTypes.includes(fileType)) {
            throw new Error('Tipo de archivo no permitido. Solo se permiten: JPG, PNG, WebP');
          }
        }

        // Validar tamaño
        if (clientPayload && typeof clientPayload === 'object' && 'size' in clientPayload) {
          const fileSize = clientPayload.size as number;
          if (fileSize > maxSize) {
            throw new Error('Archivo muy grande. Máximo 10MB permitido');
          }
        }

        // Generar nombre único
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const extension = pathname.split('.').pop() || 'jpg';
        
        return {
          allowedContentTypes: allowedTypes,
          tokenPayload: JSON.stringify({
            pathname: `products/${timestamp}-${randomString}.${extension}`,
            timestamp,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('✅ Upload completed:', blob.url);
        
        // Aquí podrías agregar lógica adicional como:
        // - Guardar referencia en base de datos
        // - Procesar imagen (resize, optimización)
        // - Notificar a otros servicios
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Error in blob upload:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al subir imagen' },
      { status: 400 }
    );
  }
}