// Sistema de upload local de archivos
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export interface UploadResult {
  filename: string;
  url: string;
  size: number;
  type: string;
}

export async function uploadImageLocally(file: File): Promise<UploadResult> {
  try {
    // Crear directorio de uploads si no existe
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${timestamp}-${randomString}.${extension}`;
    const filepath = path.join(uploadDir, filename);

    // Convertir File a Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Guardar archivo
    await writeFile(filepath, buffer);

    return {
      filename,
      url: `/uploads/products/${filename}`,
      size: file.size,
      type: file.type
    };
  } catch (error) {
    console.error('Error uploading file locally:', error);
    throw new Error('Error al subir imagen');
  }
}

export function getImageUrl(filename: string): string {
  return `/uploads/products/${filename}`;
}

export async function deleteImageLocally(filename: string): Promise<void> {
  try {
    const { unlink } = await import('fs/promises');
    const filepath = path.join(process.cwd(), 'public', 'uploads', 'products', filename);
    
    if (existsSync(filepath)) {
      await unlink(filepath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    // No lanzar error si no se puede eliminar
  }
}