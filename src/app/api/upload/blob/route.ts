import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Validaciones de seguridad
        if (!pathname.startsWith('products/')) {
          throw new Error('Invalid pathname');
        }
        
        // Aquí podrías agregar validaciones adicionales como autenticación
        // Por ejemplo, verificar que el usuario sea admin
        
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
          maximumSizeInBytes: 10 * 1024 * 1024, // 10MB
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('Blob uploaded successfully:', blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Error in blob upload handler:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}